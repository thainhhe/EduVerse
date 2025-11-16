import React, { useState, useRef, useEffect } from "react";
import { sendChatQuery } from "../../services/chatbotService";

const widgetBox = {
  position: "fixed",
  right: 20,
  bottom: 90,
  width: 360,
  height: 480,
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: 10,
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  zIndex: 1200,
};

const toggleBtnStyle = {
  position: "fixed",
  right: 20,
  bottom: 20,
  width: 60,
  height: 60,
  borderRadius: "50%",
  background: "#0b74ff",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  zIndex: 1300,
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

export const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Chào bạn! Tôi có thể giúp gì cho bạn?" },
  ]);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current)
      listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  const parseBotText = (text) => {
    if (!text) return { paragraphs: [], bullets: [], source: null };

    // tách phần "Nguồn" (có thể là "Nguồn:" hoặc "**Nguồn:**")
    const sourceMatch = text.match(/(?:\*\*)?Nguồn(?:\*\*)?:\s*([\s\S]*)$/i);
    const source = sourceMatch ? sourceMatch[1].trim() : null;
    let main = sourceMatch
      ? text.slice(0, sourceMatch.index).trim()
      : text.trim();

    // 1) Loại bỏ các ký tự thừa ở đầu/cuối do format lạ: ví dụ "*( " hoặc trailing ")"
    main = main.replace(/^[\s\*\(\-]+/, "").replace(/[\s\*\)\-]+$/, "");

    // 2) Giải mã markdown bold **...** và inline links [text](url) -> text
    main = main.replace(/\*\*(.+?)\*\*/gs, "$1");
    main = main.replace(/\[(.+?)\]\((?:.+?)\)/gs, "$1");

    // 3) Nếu không có newline nhưng có nhiều phần ngăn bằng "*", coi đó là inline bullets
    if (!main.includes("\n") && /\*\s*[^ ]+/.test(main)) {
      const parts = main
        .split(/\s*\*\s*/)
        .map((s) => s.replace(/^\s+|\s+$/g, ""))
        .filter(Boolean);
      if (parts.length > 1) {
        // remove possible surrounding bold/italics in each part
        const cleaned = parts.map((p) =>
          p.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1")
        );
        return { paragraphs: [], bullets: cleaned, source };
      }
    }

    // 4) Xử lý theo dòng: giữ bullets bắt đầu bằng '*', '-' hoặc '•'
    const lines = main.split(/\r?\n/).map((l) => l.replace(/^\s+|\s+$/g, ""));
    const bullets = [];
    const paragraphs = [];
    let currentPara = [];

    lines.forEach((line) => {
      // normalize inner markdown for the line (but keep leading bullet marker)
      const isBulletLine = /^(\*|-|\u2022)\s+/.test(line);
      const content = isBulletLine
        ? line.replace(/^(\*|-|\u2022)\s+/, "")
        : line;
      // remove bold/italic inside
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
    });

    if (currentPara.length) paragraphs.push(currentPara.join(" "));

    return { paragraphs, bullets, source };
  };

  const handleSend = async () => {
    const text = value.trim();
    if (!text) return;
    const userMsg = { sender: "user", text };
    setMessages((s) => [...s, userMsg]);
    setValue("");
    setLoading(true);

    const history = messages.map((m) => ({ sender: m.sender, text: m.text }));
    try {
      const data = await sendChatQuery(text, history);
      const botText =
        data?.reply || data?.data?.reply || "Xin lỗi, tôi đang gặp lỗi.";
      setMessages((s) => [...s, { sender: "bot", text: botText }]);
    } catch (err) {
      setMessages((s) => [
        ...s,
        { sender: "bot", text: "Lỗi kết nối. Vui lòng thử lại." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderBotMessage = (text, idx) => {
    const { paragraphs, bullets, source } = parseBotText(text);
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
          <div
            style={{
              padding: 12,
              borderBottom: "1px solid #eee",
              background: "#fafafa",
            }}
          >
            <strong>EduVerse Bot</strong>
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
        {open ? "×" : "💬"}
      </button>
    </>
  );
};
