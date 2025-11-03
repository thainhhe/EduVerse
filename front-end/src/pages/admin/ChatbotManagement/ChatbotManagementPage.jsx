import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const mockItems = [
  {
    id: "R-1",
    reporter: "Alice Smith",
    question: "How do I reset my password?",
    incorrectAnswer: "Please contact support for a password reset.",
    date: "2023-10-26",
    status: "Unprocessed",
  },
  {
    id: "R-2",
    reporter: "Bob Johnson",
    question: "What courses are available for beginners?",
    incorrectAnswer: "All courses require prior experience.",
    date: "2023-10-25",
    status: "Processed",
  },
];

const ChatbotManagementPage = () => {
  const [tab, setTab] = useState("reported");
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    // TODO: replace with API call
    setItems(mockItems);
  }, []);

  const markProcessed = (id) => {
    console.log("mark processed", id);
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "Processed" } : i))
    );
  };

  const removeItem = (id) => {
    console.log("delete", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

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
        <Card>
          <CardHeader className="px-6 py-4">
            <h3 className="text-lg font-medium">Reported Chatbot Questions</h3>
          </CardHeader>
          <CardContent className="p-0 overflow-auto">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Input placeholder="Search reporter or question..." />
                <Button variant="outline">Filter</Button>
              </div>

              <table className="w-full table-auto text-sm">
                <thead className="text-left text-muted-foreground border-b">
                  <tr>
                    <th className="px-3 py-2">Reporter</th>
                    <th className="px-3 py-2">Question</th>
                    <th className="px-3 py-2">Incorrect Answer</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="border-b">
                      <td className="px-3 py-3">{it.reporter}</td>
                      <td className="px-3 py-3 max-w-[320px] truncate">
                        {it.question}
                      </td>
                      <td className="px-3 py-3 text-rose-600 max-w-[300px] truncate">
                        {it.incorrectAnswer}
                      </td>
                      <td className="px-3 py-3">{it.date}</td>
                      <td className="px-3 py-3">
                        <Badge className="text-xs">{it.status}</Badge>
                      </td>
                      <td className="px-3 py-3 space-x-2">
                        {it.status !== "Processed" && (
                          <Button
                            variant="outline"
                            onClick={() => markProcessed(it.id)}
                          >
                            Mark Processed
                          </Button>
                        )}
                        <Button
                          className="bg-red-600 text-white"
                          onClick={() => removeItem(it.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* pagination (simple) */}
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
