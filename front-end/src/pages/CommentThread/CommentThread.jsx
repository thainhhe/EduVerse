"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import CommentItem from "./CommentItem";

export default function CommentThread({ forumId, userId, courseId, canComment }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState("");

    console.log("canComment", canComment)
    // 🔹 Load danh sách bình luận
    const fetchComments = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `http://localhost:9999/api/v1/comment/forum/${forumId}`
            );
            const json = await res.json();
            setComments(json.data || []);
        } catch (err) {
            console.error("❌ Lỗi khi load comment:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (forumId) fetchComments();
    }, [forumId]);


    const handleCreateComment = async () => {
        if (!canComment) {
            alert("⚠️ Bạn cần đăng ký khóa học trước khi bình luận!");
            return;
        }
        if (!newComment.trim()) return;

        try {
            const res = await fetch(
                "http://localhost:9999/api/v1/comment/create-comment",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        forumId,
                        userId,
                        content: newComment,
                        parentCommentId: null,
                    }),
                }
            );

            const data = await res.json();
            if (data.status === 200 || data.success) {
                setComments((prev) => [data.data, ...prev]);
                setNewComment("");
            } else {
                alert("Không thể gửi bình luận!");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <main className=" bg-background">
            <div className="max-w-3xl mx-auto space-y-5 mt-5">
                {/* Ô nhập bình luận */}
                <div className="flex items-center gap-2">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={
                            canComment
                                ? "Viết bình luận của bạn..."
                                : "Bạn cần đăng ký khóa học để bình luận"
                        }
                        rows={3}
                        disabled={!canComment}
                        className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <Button
                        size="sm"
                        onClick={handleCreateComment}
                        disabled={!canComment}
                        className="bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>

                {/* Danh sách bình luận */}
                <div className="max-h-[700px] overflow-y-auto p-2  ">
                    {loading ? (
                        <p className="">Đang tải bình luận...</p>
                    ) : comments.length > 0 ? (
                        comments.map((c) => (
                            <CommentItem
                                key={c._id}
                                comment={c}
                                level={0}
                                forumId={forumId}
                                userId={userId}
                                refresh={fetchComments}
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm italic">Chưa có bình luận nào</p>
                    )}
                </div>

            </div>
        </main>
    );
}
