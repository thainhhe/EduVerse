import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Filter, MessageSquare } from "lucide-react";
import CommentItem from "./ItemC";
import { commentService } from "@/services/comment";
import { ToastHelper } from "@/helper/ToastHelper";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CommentList({ forumId, userId, canComment, isMainInstructor, isCollab }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [filter, setFilter] = useState("all");

    // Load danh sách bình luận
    const fetchComments = async () => {
        setLoading(true);
        try {
            const res = await commentService.getAllCommentInstructor(forumId);
            if (res.success) setComments(res.data.filter((c) => c.status !== "deleted") || []);
        } catch (err) {
            console.error("❌ Error loading comments:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (forumId) fetchComments();
    }, [forumId]);

    const handleCreateComment = async () => {
        if (!canComment) {
            ToastHelper.error("You need to enroll in the course before commenting!");
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
                    canComment,
                }),
            });

            const data = await res.json();
            if (data.status === 200 || data.success) {
                setComments((prev) => [data.data, ...prev]);
                setNewComment("");
                ToastHelper.success("Comment sent successfully!");
            } else {
                ToastHelper.error("Failed to send comment!");
            }
        } catch (err) {
            console.error(err);
            ToastHelper.error("Failed to send comment!");
        }
    };

    const getFilteredComments = () => {
        let result = [...comments];
        switch (filter) {
            case "reported":
                result = result.filter((c) => {
                    const selfReported = c.reported && c.reported.length > 0;
                    const childReported =
                        c.childComments &&
                        c.childComments.some((child) => child.reported && child.reported.length > 0);
                    return selfReported || childReported;
                });
                break;
            case "hidden":
                result = result.filter((c) => c.status === "hidden");
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
        <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                <div className="flex items-center gap-3 flex-1">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="flex-1 sm:flex-none px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                        <option value="all">All comments</option>
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="reported">Reported</option>
                        {isMainInstructor && (
                            <>
                                <option value="hidden">Hidden</option>
                            </>
                        )}
                    </select>
                </div>
                <Badge
                    variant="secondary"
                    className="bg-indigo-100 text-indigo-700 border-indigo-200 px-3 py-1"
                >
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {displayComments.length} comments
                </Badge>
            </div>

            {/* Comments List */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="max-h-[calc(100vh-400px)] overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                                <p className="text-sm text-gray-500">Loading comments...</p>
                            </div>
                        </div>
                    ) : displayComments.length > 0 ? (
                        displayComments.map((c) => (
                            <CommentItem
                                key={c._id}
                                comment={c}
                                level={0}
                                forumId={forumId}
                                userId={userId}
                                refresh={fetchComments}
                                isMainInstructor={isMainInstructor}
                                isCollab={isCollab}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                                <MessageSquare className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium mb-1">No comments yet</p>
                            <p className="text-sm text-gray-400">Be the first to comment!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Comment Input */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={
                        canComment ? "Share your thoughts..." : "You need to enroll in the course to comment"
                    }
                    disabled={!canComment}
                    rows={3}
                    className={cn(
                        "w-full resize-none border-0 bg-transparent px-4 py-3 text-sm focus:ring-0 placeholder:text-gray-400",
                        !canComment && "cursor-not-allowed bg-gray-50"
                    )}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                            handleCreateComment();
                        }
                    }}
                />
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50/50 border-t border-gray-100">
                    <p className="text-xs text-gray-400 font-medium">
                        {canComment ? "Press Ctrl + Enter to send fast" : ""}
                    </p>
                    <Button
                        onClick={handleCreateComment}
                        disabled={!canComment || !newComment.trim()}
                        size="sm"
                        className={cn(
                            "px-4 transition-all",
                            canComment
                                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        )}
                    >
                        Send comment
                        <Send className="w-3 h-3 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
