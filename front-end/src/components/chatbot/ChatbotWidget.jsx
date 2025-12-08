import React, { useState, useRef, useEffect } from "react";
import { streamChatQuery } from "../../services/chatbotService";

const widgetBox = {
  position: "fixed",
  right: 20,
  bottom: 90,
  width: 360,
  height: 480,
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: 16,
  boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  zIndex: 1200,
};

const toggleBtnStyle = {
  position: "fixed",
  right: 20,
  bottom: 20,
  width: 68,
  height: 68,
  borderRadius: "50%",
  background: "transparent",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  zIndex: 1300,
  padding: 0,
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  overflow: "hidden",
};

const sourceBoxStyle = {
  marginTop: 8,
  padding: 8,
  background: "#f7f7f8",
  borderRadius: 6,
  fontSize: 12,
  color: "#444",
  border: "1px solid #eee",
  maxHeight: 120,
  overflow: "auto",
};

const headerIconStyle = {
  width: 28, // Thay đổi: Icon lớn hơn
  height: 28,
  marginRight: 8,
};

export const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Chào bạn! Tôi có thể giúp gì cho bạn?" },
  ]);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentBotMessageId, setCurrentBotMessageId] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current)
      listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  const parseBotText = (text) => {
    if (!text)
      return { numbered: false, paragraphs: [], bullets: [], source: null };

    if (/\n\s*\d+\.\s/.test("\n" + text)) {
      const rawItems = text
        .split(/\n\s*(?=\d+\.\s)/)
        .map((s) => s.trim())
        .filter(Boolean);
      const items = rawItems.map((item) => {
        const m = item.match(/^\s*\d+\.\s*(.*)$/s);
        let body = m ? m[1].trim() : item;
        const srcIdx = body.search(/Nguồn\s*[:\-–]\s*/i);
        let source = null;
        if (srcIdx !== -1) {
          source = body
            .slice(srcIdx)
            .replace(/^[^\:]*[:\-–]\s*/i, "")
            .trim();
          body = body.slice(0, srcIdx).trim();
        }
        body = body
          .replace(/^\s*[\*\-]+\s*/, "")
          .replace(/^\*+|\*+$/g, "")
          .trim();
        if (source)
          source = source
            .replace(/^\*+|\*+$/g, "")
            .replace(/[\)\s]+$/g, "")
            .trim();
        body = body
          .replace(/\*\*(.+?)\*\*/gs, "$1")
          .replace(/\*(.+?)\*/gs, "$1");
        return { content: body, source };
      });

      return { numbered: true, items };
    }

    const rawLines = text.split(/\r?\n/);
    const lines = rawLines.map((l) => l.replace(/^\s+|\s+$/g, ""));

    let source = null;
    for (let i = lines.length - 1; i >= 0; i--) {
      const withoutBullet = lines[i].replace(/^(\*+|\-|\u2022)\s*/, "").trim();
      const normalized = withoutBullet.replace(/^[\(\*\s]+|[\)\*\s]+$/g, "");
      const startMatch = normalized.match(
        /^(?:\*{0,2})?Nguồn\b\s*[:\-–]?\s*(.*)$/i
      );
      if (startMatch) {
        source = startMatch[1] ? startMatch[1].trim() : "";
        lines.splice(i, 1);
        break;
      }
      const inlineMatch = lines[i].match(/Nguồn\s*[:\-–]\s*([^\)\n\r]*)/i);
      if (inlineMatch) {
        source = inlineMatch[1].trim();
        lines[i] = lines[i].replace(inlineMatch[0], "").trim();
        if (!lines[i]) lines.splice(i, 1);
        break;
      }
    }

    let main = lines.join("\n").trim();
    main = main.replace(/^[\s\*\(\-]+/, "").replace(/[\s\*\)\-]+$/, "");
    if (source)
      source = source.replace(/^[\s\*\(\-]+/, "").replace(/[\s\*\)\-]+$/, "");
    main = main
      .replace(/\*\*(.+?)\*\*/gs, "$1")
      .replace(/\[(.+?)\]\((?:.+?)\)/gs, "$1");

    if (!main.includes("\n") && /\*\s*[^ ]+/.test(main)) {
      const parts = main
        .split(/\s*\*\s*/)
        .map((s) => s.replace(/^\s+|\s+$/g, ""))
        .filter(Boolean);
      if (parts.length > 1) {
        const cleaned = parts.map((p) =>
          p.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1")
        );
        return { numbered: false, paragraphs: [], bullets: cleaned, source };
      }
    }

    const finalLines = main
      .split(/\r?\n/)
      .map((l) => l.replace(/^\s+|\s+$/g, ""));
    const bullets = [];
    const paragraphs = [];
    let currentPara = [];

    for (const line of finalLines) {
      const isBulletLine = /^(\*|-|\u2022)\s+/.test(line);
      const content = isBulletLine
        ? line.replace(/^(\*|-|\u2022)\s+/, "")
        : line;
      const cleanedLine = content
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1");
      if (isBulletLine) {
        bullets.push(cleanedLine.trim());
      } else if (cleanedLine === "") {
        if (currentPara.length) {
          paragraphs.push(currentPara.join(" "));
          currentPara = [];
        }
      } else {
        currentPara.push(cleanedLine);
      }
    }

    if (currentPara.length) paragraphs.push(currentPara.join(" "));

    return { numbered: false, paragraphs, bullets, source };
  };

  const handleSend = async () => {
    const text = value.trim();
    if (!text) return;
    const userMsg = { sender: "user", text };

    const tempBotMsgId = Date.now();

    // Append user message and placeholder bot message
    setMessages((s) => [
      ...s,
      userMsg,
      { sender: "bot", text: "", id: tempBotMsgId },
    ]);
    setCurrentBotMessageId(tempBotMsgId);
    setValue("");
    setLoading(true);

    const history = messages.map((m) => ({ sender: m.sender, text: m.text }));

    // Handlers for streaming
    const onChunk = (chunk) => {
      setMessages((prevMessages) => {
        const idx = prevMessages.map((m) => m.id).lastIndexOf(tempBotMsgId);
        if (idx !== -1) {
          const updated = [...prevMessages];
          updated[idx] = {
            ...updated[idx],
            text: (updated[idx].text || "") + chunk,
          };
          return updated;
        }
        const last = prevMessages[prevMessages.length - 1];
        if (last && last.id === tempBotMsgId) {
          return [
            ...prevMessages.slice(0, -1),
            { ...last, text: (last.text || "") + chunk },
          ];
        }
        return prevMessages;
      });
    };

    const onError = (errorMsg) => {
      setMessages((prevMessages) => {
        const idx = prevMessages.map((m) => m.id).lastIndexOf(tempBotMsgId);
        if (idx !== -1) {
          const updated = [...prevMessages];
          updated[idx] = {
            sender: "bot",
            text: `Lỗi: ${errorMsg}`,
            id: tempBotMsgId,
          };
          return updated;
        }
        return [
          ...prevMessages,
          { sender: "bot", text: `Lỗi: ${errorMsg}`, id: tempBotMsgId },
        ];
      });
      setLoading(false);
      setCurrentBotMessageId(null);
    };

    const onEnd = (finalData) => {
      const reply = finalData?.reply ?? "";
      setMessages((prevMessages) => {
        const idx = prevMessages.map((m) => m.id).lastIndexOf(tempBotMsgId);
        if (idx !== -1) {
          const updated = [...prevMessages];
          updated[idx] = { sender: "bot", text: reply, id: tempBotMsgId };
          return updated;
        }
        return [
          ...prevMessages,
          { sender: "bot", text: reply, id: tempBotMsgId },
        ];
      });
      setLoading(false);
      setCurrentBotMessageId(null);
    };

    try {
      await streamChatQuery(text, history, onChunk, onEnd, onError);
    } catch (err) {
      onError("Lỗi kết nối.");
    }
  };

  const renderBotMessage = (text, idx) => {
    const parsed = parseBotText(text);

    if (parsed.numbered && Array.isArray(parsed.items)) {
      return (
        <div key={idx} style={{ marginBottom: 8, width: "100%" }}>
          {parsed.items.map((it, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div
                style={{ color: "#222", lineHeight: "1.4", marginBottom: 6 }}
              >
                {it.content}
              </div>
              {it.source && (
                <div style={sourceBoxStyle}>
                  <strong style={{ display: "block", marginBottom: 6 }}>
                    Nguồn
                  </strong>
                  <div style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>
                    {it.source}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    const { paragraphs, bullets, source } = parsed;
    return (
      <div key={idx} style={{ marginBottom: 8, width: "100%" }}>
        {paragraphs.map((p, i) => (
          <div
            key={i}
            style={{ marginBottom: 6, color: "#222", lineHeight: "1.4" }}
          >
            {p}
          </div>
        ))}

        {bullets.length > 0 && (
          <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
            {bullets.map((b, i) => (
              <li key={i} style={{ marginBottom: 6, color: "#222" }}>
                {b}
              </li>
            ))}
          </ul>
        )}

        {source && (
          <div style={sourceBoxStyle}>
            <strong style={{ display: "block", marginBottom: 6 }}>Nguồn</strong>
            <div style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{source}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {open && (
        <div style={widgetBox}>
          {/* Thay đổi: Header mới */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 12,
              borderBottom: "1px solid #eee",
              background: "#f0f4ff",
              color: "#4F39F6",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src="/w.png"
                alt="Robot Icon"
                style={{
                  ...headerIconStyle,
                  borderRadius: "50%",
                  border: "1px solid #4F39F6",
                }}
              />
              <strong style={{ fontSize: 16 }}>EduVerse Chatbot</strong>
            </div>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Bạn có chắc chắn muốn xóa tất cả lịch sử trò chuyện?"
                  )
                ) {
                  setMessages([
                    {
                      sender: "bot",
                      text: "Chào bạn! Tôi có thể giúp gì cho bạn?",
                    },
                  ]);
                }
              }}
              style={{
                background: "none",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                color: "#4F39F6",
                padding: 4,
                lineHeight: 1,
              }}
              aria-label="Clear chat"
              title="Xóa lịch sử trò chuyện"
            >
              &#9763; {/* Biểu tượng xương chéo (hoặc dùng 'x') */}
            </button>
          </div>

          <div
            ref={listRef}
            style={{
              flex: 1,
              padding: 12,
              overflowY: "auto",
              background: "#fafcff",
            }}
          >
            {messages.map((m, i) => {
              if (m.sender === "bot") {
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "78%",
                        padding: "8px 12px",
                        borderRadius: 14,
                        background: "#eee",
                        color: "#111",
                      }}
                    >
                      {renderBotMessage(m.text, i)}
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      maxWidth: "78%",
                      padding: "8px 12px",
                      borderRadius: 14,
                      background: "#0b74ff",
                      color: "#fff",
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div style={{ fontStyle: "italic" }}>Bot đang trả lời...</div>
            )}
          </div>

          <div
            style={{ display: "flex", padding: 8, borderTop: "1px solid #eee" }}
          >
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Nhập tin nhắn..."
              style={{
                flex: 1,
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #ddd",
                outline: "none",
              }}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading}
              style={{
                marginLeft: 8,
                padding: "8px 12px",
                borderRadius: 6,
                background: "#0b74ff",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Gửi
            </button>
          </div>
        </div>
      )}

      <button
        style={toggleBtnStyle}
        onClick={() => setOpen((s) => !s)}
        aria-label="Toggle chat"
      >
        {/* Thay đổi: Sử dụng hình ảnh robot */}
        <img
          src="/w.png"
          alt="Chatbot Avatar"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </button>
    </>
  );
};
