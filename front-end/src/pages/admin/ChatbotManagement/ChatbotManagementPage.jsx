import adminService from "@/services/adminService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import React, { useState, useEffect } from "react";

import { Card, CardHeader, CardContent } from "@/components/ui/card";

const ChatbotManagementPage = () => {
  const [tab, setTab] = useState("reported");
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null); // { userId, messages }

  useEffect(() => {
    if (tab === "reported") fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page]);

  async function fetchList() {
    setLoading(true);
    try {
      const skip = (page - 1) * limit;
      const data = await adminService.getChatHistories({
        limit,
        skip,
        search: search || undefined,
      });
      // data expected array of { userId, messages, updatedAt, createdAt }
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetch chat histories failed", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function onSearch(e) {
    e?.preventDefault();
    setPage(1);
    await fetchList();
  }

  async function viewHistory(userId, username) {
    try {
      setLoading(true);
      const data = await adminService.getChatHistory(userId);
      // attach display name when available
      const result = data ?? { userId, messages: [] };
      result.userName =
        username || (result.user && result.user.username) || undefined;
      setSelectedHistory(result);
    } catch (err) {
      console.error("getHistory failed", err);
      setSelectedHistory({ userId, messages: [], userName: username });
    } finally {
      setLoading(false);
    }
  }

  async function clearHistory(userId) {
    if (!window.confirm("Xác nhận xóa tất cả tin nhắn của người dùng này?"))
      return;
    try {
      await adminService.clearChatHistory(userId);
      await fetchList();
      if (selectedHistory?.userId === userId) setSelectedHistory(null);
    } catch (err) {
      console.error("clearHistory failed", err);
    }
  }

  async function deleteHistory(userId) {
    if (!window.confirm("Xác nhận xoá hẳn bản ghi chat history này?")) return;
    try {
      await adminService.deleteChatHistory(userId);
      await fetchList();
      if (selectedHistory?.userId === userId) setSelectedHistory(null);
    } catch (err) {
      console.error("deleteHistory failed", err);
    }
  }

  // helpers to show last message & count
  function lastMessage(item) {
    const msgs = item.messages || [];
    if (msgs.length === 0) return "-";
    const m = msgs[msgs.length - 1];
    return `${m.sender}: ${m.message}`.slice(0, 120);
  }

  function messagesCount(item) {
    return (item.messages && item.messages.length) || 0;
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Chatbot Management</h2>

      <div className="flex gap-2">
        <button
          className={`px-4 py-2 rounded ${
            tab === "reported" ? "bg-indigo-600 text-white" : "bg-gray-100"
          }`}
          onClick={() => setTab("reported")}
        >
          Reported Questions
        </button>
        <button
          className={`px-4 py-2 rounded ${
            tab === "faq" ? "bg-indigo-600 text-white" : "bg-gray-100"
          }`}
          onClick={() => setTab("faq")}
        >
          Auto FAQ Management
        </button>
      </div>

      {tab === "reported" && (
        <div>
          <Card>
            <CardHeader className="px-6 py-4">
              <h3 className="text-lg font-medium">Chat Histories</h3>
            </CardHeader>
            <CardContent className="p-0 overflow-auto">
              <div className="p-4">
                <form
                  className="flex items-center gap-3 mb-4"
                  onSubmit={onSearch}
                >
                  <Input
                    placeholder="Search userId or message..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Button type="submit">Search</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch("");
                      setPage(1);
                      fetchList();
                    }}
                  >
                    Reset
                  </Button>
                </form>

                <table className="w-full table-auto text-sm">
                  <thead className="text-left text-muted-foreground border-b">
                    <tr>
                      <th className="px-3 py-2">User Name</th>
                      <th className="px-3 py-2">Messages</th>
                      <th className="px-3 py-2">Last Message</th>
                      <th className="px-3 py-2">Updated At</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center">
                          Loading...
                        </td>
                      </tr>
                    ) : items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          No histories found.
                        </td>
                      </tr>
                    ) : (
                      items.map((it) => (
                        <tr key={String(it.userId)} className="border-b">
                          <td className="px-3 py-3 max-w-[240px] truncate">
                            {it.user && it.user.username
                              ? it.user.username
                              : String(it.userId || it._id)}
                          </td>
                          <td className="px-3 py-3">{messagesCount(it)}</td>
                          <td className="px-3 py-3 max-w-[320px] truncate">
                            {lastMessage(it)}
                          </td>
                          <td className="px-3 py-3">
                            {it.updatedAt
                              ? new Date(it.updatedAt).toLocaleString()
                              : "-"}
                          </td>
                          <td className="px-3 py-3 space-x-2">
                            <Button
                              variant="outline"
                              onClick={() =>
                                viewHistory(
                                  String(it.userId),
                                  it.user?.username
                                )
                              }
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => clearHistory(String(it.userId))}
                            >
                              Clear
                            </Button>
                            <Button
                              className="bg-red-600 text-white"
                              onClick={() => deleteHistory(String(it.userId))}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <div className="flex items-center justify-center mt-4 gap-3 text-sm text-muted-foreground">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    Previous
                  </button>
                  <div className="px-3 py-1 border rounded">{page}</div>
                  <button onClick={() => setPage((p) => p + 1)}>Next</button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected history panel */}
          {selectedHistory && (
            <Card className="mt-4">
              <CardHeader className="px-6 py-4">
                <h3 className="text-lg font-medium">
                  History for{" "}
                  {selectedHistory.userName ??
                    (selectedHistory.user && selectedHistory.user.username) ??
                    selectedHistory.userId}
                </h3>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 max-h-72 overflow-auto">
                  {(selectedHistory.messages || []).map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded ${
                        m.sender === "bot" ? "bg-gray-100" : "bg-indigo-50"
                      }`}
                    >
                      <div className="text-xs text-muted-foreground">
                        {m.sender} • {new Date(m.timestamp).toLocaleString()}
                      </div>
                      <div className="text-sm">{m.message}</div>
                    </div>
                  ))}
                  {(selectedHistory.messages || []).length === 0 && (
                    <div className="text-sm text-muted-foreground">
                      No messages.
                    </div>
                  )}
                </div>
                <div className="mt-3 space-x-2">
                  <Button onClick={() => setSelectedHistory(null)}>
                    Close
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => clearHistory(String(selectedHistory.userId))}
                  >
                    Clear
                  </Button>
                  <Button
                    className="bg-red-600 text-white"
                    onClick={() =>
                      deleteHistory(String(selectedHistory.userId))
                    }
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {tab === "faq" && (
        <Card>
          <CardHeader className="px-6 py-4">
            <h3 className="text-lg font-medium">Auto FAQ Management</h3>
          </CardHeader>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Section for managing auto-FAQ entries (CRUD). Implement UI/actions
            as needed.
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChatbotManagementPage;
