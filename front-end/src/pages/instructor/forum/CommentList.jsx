"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import CommentItem from "./ItemC";
import { commentService } from "@/services/comment";

export default function CommentList({ forumId, userId, canComment, isMainInstructor }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState("");

    console.log("main?", isMainInstructor);
    // 🔹 Load danh sách bình luận
    const fetchComments = async () => {
        setLoading(true);
        try {
            const res = await commentService.getAllCommentInstructor(forumId);
            if (res.success) setComments(res.data || []);
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
            const res = await fetch("http://localhost:9999/api/v1/comment/create-comment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    forumId,
                    userId,
                    content: newComment,
                    parentCommentId: null,
                }),
            });

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
    const [filter, setFilter] = useState("all");
    const getFilteredComments = () => {
        let result = [...comments];
        switch (filter) {
            case "reported":
                result = result.filter((c) => {
                    const selfReported = c.reported && c.reported.length > 0;
                    const childReported =
                        c.childComments && c.childComments.some((child) => child.reported && child.reported.length > 0);

                    return selfReported || childReported;
                });
                break;
            case "hidden":
                result = result.filter((c) => c.status === "hidden");
                break;
            case "deleted":
                result = result.filter((c) => c.status === "deleted");
                break;
        }
        if (filter === "newest") {
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        if (filter === "oldest") {
            result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }
        return result;
    };

    const displayComments = getFilteredComments();

    return (
        <div className="max-w-full space-y-1 mx-auto mt-2">
            <div className="flex-1 flex gap-2 items-center">
                <select value={filter} onChange={(e) => setFilter(e.target.value)} className="text-sm">
                    <option value="all">Tất cả bình luận</option>
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    {isMainInstructor && (
                        <>
                            <option value="reported">Bị báo cáo</option>
                            <option value="hidden">Đã ẩn</option>
                            <option value="deleted">Đã xóa</option>
                        </>
                    )}
                </select>
                <span className="text-indigo-600">{displayComments.length} bình luận</span>
            </div>
            {/* Danh sách bình luận */}
            <div className="max-h-[500px] overflow-y-auto">
                {loading ? (
                    <p className="">Đang tải bình luận...</p>
                ) : comments.length > 0 ? (
                    displayComments.map((c) => (
                        <CommentItem
                            key={c._id}
                            comment={c}
                            level={0}
                            forumId={forumId}
                            userId={userId}
                            refresh={fetchComments}
                            isMainInstructor={isMainInstructor}
                        />
                    ))
                ) : (
                    <p className="text-gray-500 text-sm italic">Chưa có bình luận nào</p>
                )}
            </div>
            <div className="flex items-center gap-2">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={canComment ? "Viết bình luận của bạn..." : "Bạn cần đăng ký khóa học để bình luận"}
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
        </div>
    );
}
