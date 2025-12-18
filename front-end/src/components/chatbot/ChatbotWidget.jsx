import React, { useState, useRef, useEffect } from "react";
import { streamChatQuery } from "../../services/chatbotService";
import { ConfirmationHelper } from "../../helper/ConfirmationHelper";
import { ToastHelper } from "../../helper/ToastHelper";

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
    { sender: "bot", text: "Hello! How can I help you today?" },
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
    if (!text) return { numbered: false, blocks: [], sources: [] };

    // --- BƯỚC 1: Tách nguồn (Áp dụng Global cho mọi loại tin nhắn) ---
    let cleanText = text;
    const extractedSources = new Set();
    const sourceRegex =
      /(?:[\(\[])?\s*Nguồn\s*[:\-–]\s*([^\)\n\r\]]+)(?:[\)\]])?/gi;

    cleanText = cleanText.replace(sourceRegex, (match, sourceContent) => {
      if (sourceContent && sourceContent.trim()) {
        extractedSources.add(sourceContent.trim());
      }
      return ""; // Xóa nguồn khỏi văn bản
    });

    const sourcesArray = Array.from(extractedSources);

    // --- BƯỚC 2: Kiểm tra xem có phải Numbered List không ---
    if (/\n\s*\d+\.\s/.test("\n" + cleanText)) {
      const rawItems = cleanText
        .split(/\n\s*(?=\d+\.\s)/)
        .map((s) => s.trim())
        .filter(Boolean);

      const items = rawItems.map((item) => {
        const m = item.match(/^\s*\d+\.\s*(.*)$/s);
        let body = m ? m[1].trim() : item;

        // Cleanup formatting
        body = body
          .replace(/^\s*[\*\-]+\s*/, "")
          .replace(/^\*+|\*+$/g, "")
          .replace(/\*\*(.+?)\*\*/gs, "$1")
          .replace(/\[(.+?)\]\((?:.+?)\)/gs, "$1")
          .trim();

        return { content: body };
      });

      return { numbered: true, items, sources: sourcesArray };
    }

    // --- BƯỚC 3: Xử lý văn bản thường (Blocks) ---
    const rawLines = cleanText.split(/\r?\n/);
    const lines = rawLines.map((l) => l.trim()).filter((l) => l !== "");

    const blocks = [];
    for (const line of lines) {
      const isBulletLine = /^(\*|-|\u2022)\s+/.test(line);
      const rawContent = isBulletLine
        ? line.replace(/^(\*|-|\u2022)\s+/, "")
        : line;

      const content = rawContent
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .trim();

      if (isBulletLine) {
        const lastBlock = blocks[blocks.length - 1];
        if (lastBlock && lastBlock.type === "list") {
          lastBlock.items.push(content);
        } else {
          blocks.push({ type: "list", items: [content] });
        }
      } else {
        if (content === "") continue;

        const lastBlock = blocks[blocks.length - 1];
        if (lastBlock && lastBlock.type === "paragraph") {
          lastBlock.content += " " + content;
        } else {
          blocks.push({ type: "paragraph", content: content });
        }
      }
    }

    return { numbered: false, blocks, sources: sourcesArray };
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
    const { numbered, items, blocks, sources } = parseBotText(text);

    // Case 1: Numbered List
    if (numbered && Array.isArray(items)) {
      return (
        <div key={idx} style={{ marginBottom: 8, width: "100%" }}>
          {items.map((it, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ color: "#222", lineHeight: "1.4" }}>
                {i + 1}. {it.content}
              </div>
            </div>
          ))}

          {/* Hiển thị Nguồn chung cho Numbered List */}
          {/* {sources && sources.length > 0 && (
            <div style={sourceBoxStyle}>
              <strong
                style={{
                  display: "block",
                  marginBottom: 6,
                  borderBottom: "1px solid #ddd",
                  paddingBottom: 4,
                }}
              >
                Nguồn tham khảo:
              </strong>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {sources.map((src, index) => (
                  <li key={index} style={{ marginBottom: 4, fontSize: 12 }}>
                    {src}
                  </li>
                ))}
              </ul>
            </div>
          )} */}
        </div>
      );
    }

    // Case 2: Blocks (Mixed Content)
    const safeBlocks = blocks || [];
    const safeSources = sources || [];

    return (
      <div key={idx} style={{ marginBottom: 8, width: "100%" }}>
        {/* Phần 1: Hiển thị nội dung văn bản (Liền mạch, không có nguồn xen giữa) */}
        {safeBlocks.map((block, i) => {
          if (block.type === "paragraph") {
            return (
              <div
                key={i}
                style={{ marginBottom: 6, color: "#222", lineHeight: "1.4" }}
              >
                {block.content}
              </div>
            );
          }
          if (block.type === "list") {
            return (
              <ul
                key={i}
                style={{
                  margin: "6px 0 6px 18px",
                  padding: 0,
                  marginBottom: 6,
                }}
              >
                {block.items.map((item, k) => (
                  <li key={k} style={{ marginBottom: 4, color: "#222" }}>
                    {item}
                  </li>
                ))}
              </ul>
            );
          }
          return null;
        })}

        {/* Phần 2: Hiển thị Tổng hợp Nguồn ở cuối cùng */}
        {/* {safeSources && safeSources.length > 0 && (
          <div style={sourceBoxStyle}>
            <strong
              style={{
                display: "block",
                marginBottom: 6,
                borderBottom: "1px solid #ddd",
                paddingBottom: 4,
              }}
            >
              Nguồn tham khảo:
            </strong>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {safeSources.map((src, index) => (
                <li key={index} style={{ marginBottom: 4, fontSize: 12 }}>
                  {src}
                </li>
              ))}
            </ul>
          </div>
        )} */}
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
            <ConfirmationHelper
              trigger={
                <button
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
                  title="Clear chat history"
                >
                  &#9763;
                </button>
              }
              title="Confirm Delete"
              description="Are you sure you want to delete all chat history?"
              confirmText="Delete"
              cancelText="Cancel"
              confirmBgColor="bg-red-500 hover:bg-red-600 text-white"
              onConfirm={() => {
                setMessages([
                  {
                    sender: "bot",
                    text: "Hello! How can I help you today?",
                  },
                ]);
                ToastHelper.success(
                  "Chat history has been cleared successfully!"
                );
              }}
            />
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
              <div style={{ fontStyle: "italic" }}>Bot is typing...</div>
            )}
          </div>

          <div
            style={{ display: "flex", padding: 8, borderTop: "1px solid #eee" }}
          >
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
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
              Send
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
