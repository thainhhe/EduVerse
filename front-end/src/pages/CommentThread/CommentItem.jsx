"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    ThumbsUp,
    MessageCircle,
    MoreHorizontal,
    Send,
    Trash2,
    Flag,
    PenOffIcon,
    Check,
    X,
    MoreVertical,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Avatar } from "@radix-ui/react-avatar";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ToastHelper } from "@/helper/ToastHelper";
export default function CommentItem({ comment, level, forumId, userId, refresh }) {
    const [likes, setLikes] = useState(comment.likes || 0);
    const [userLiked, setUserLiked] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [childComments, setChildComments] = useState(comment.childComments || []);
    const [showAll, setShowAll] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);

    const MAX_PREVIEW = 0;
    const visibleComments = showAll ? childComments : childComments.slice(0, MAX_PREVIEW);
    const hiddenCount = childComments.length - MAX_PREVIEW;

    const toggleLike = () => {
        setUserLiked((prev) => !prev);
        setLikes((prev) => (userLiked ? prev - 1 : prev + 1));
    };

    // 🟢 Gửi phản hồi
    const handleReply = async () => {
        if (!replyContent.trim()) return ToastHelper.error("Please enter a reply!");
        try {
            const res = await fetch("http://localhost:9999/api/v1/comment/create-comment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    forumId,
                    userId,
                    content: replyContent,
                    parentCommentId: comment._id,
                }),
            });
            const data = await res.json();
            if (res.ok && (data.status === 200 || data.success)) {
                setChildComments((prev) => [...prev, data.data]);
                setReplyContent("");
                setIsReplying(false);
            } else {
                ToastHelper.error(data.message || "Failed to send reply!");
            }
        } catch (err) {
            console.error("Reply failed:", err);
            ToastHelper.error("Failed to send reply.");
        }
    };

    // 🟢 Xóa bình luận
    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            const res = await fetch(`http://localhost:9999/api/v1/comment/${comment._id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });
            const data = await res.json();
            if (res.ok) {
                ToastHelper.success(data.message || "Comment deleted successfully!");
                setShowMenu(false);
                refresh();
            } else {
                ToastHelper.error(data.message || "Failed to delete comment!");
            }
        } catch (err) {
            console.error("Delete failed:", err);
            ToastHelper.error("Failed to delete comment.");
        }
    };

    // 🟢 Cập nhật bình luận
    const handleUpdate = async () => {
        if (!editContent.trim()) return ToastHelper.error("Comment content cannot be empty!");
        try {
            const res = await fetch(`http://localhost:9999/api/v1/comment/${comment._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, content: editContent }),
            });
            const data = await res.json();
            console.log("data", data);
            if (data.status === 200 || data.success) {
                ToastHelper.success("Comment updated successfully!");
                comment.content = editContent;
                setIsEditing(false);
                setShowMenu(false);
            } else {
                ToastHelper.error(data.message || "Failed to update comment!");
            }
        } catch (err) {
            console.error("Update failed:", err);
            ToastHelper.error("Failed to update comment.");
        }
    };

    // 🟢 Báo cáo bình luận
    const handleReport = async () => {
        const reason = prompt("Reason for reporting this comment:");
        if (!reason) return ToastHelper.error("Please enter a reason for reporting this comment!");
        try {
            const res = await fetch(`http://localhost:9999/api/v1/comment/${comment._id}/report`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, reason }),
            });
            const data = await res.json();
            ToastHelper.success(data.message || "Reported successfully!");
            setShowMenu(false);
        } catch (err) {
            console.error("Report failed:", err);
            ToastHelper.error("Failed to report comment.");
        }
    };

    const getInitial = (name) => (name && typeof name === "string" ? name.charAt(0).toUpperCase() : "?");
    const userName = comment.userId?.email?.split("@")[0] || "Người dùng";
    const isMyComment = comment.userId?._id === userId;
    const createdTime = formatDistanceToNow(new Date(comment.createdAt), {
        addSuffix: true,
        locale: vi,
    });

    return (
        <div className={`${level > 0 ? "ml-6 border-l border-gray-200 pl-4" : ""}`}>
            <div className="flex gap-3 py-3">
                <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                    <Avatar>{getInitial(comment?.userId?.email)}</Avatar>
                </div>

                <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
                        <div className="font-semibold text-sm">{userName}</div>

                        {/* Nếu đang chỉnh sửa */}
                        {isEditing ? (
                            <div className="mt-2">
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    rows={2}
                                    className="w-full text-sm border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                                <div className="flex gap-2 mt-2">
                                    <Button
                                        size="sm"
                                        onClick={handleUpdate}
                                        className="bg-green-500 text-white hover:bg-green-600"
                                    >
                                        <Check className="w-4 h-4 mr-1" /> Save
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditContent(comment.content);
                                        }}
                                    >
                                        <X className="w-4 h-4 mr-1" /> Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm mt-1">{comment.content}</div>
                        )}
                    </div>

                    {/* Các nút thao tác */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleLike}
                            className={`h-6 px-0 font-medium ${userLiked ? "text-blue-600" : ""}`}
                        >
                            <ThumbsUp className={`w-3.5 h-3.5 mr-1 ${userLiked ? "fill-current" : ""}`} />
                            {likes > 0 && likes}
                        </Button>

                        {!isEditing && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsReplying(!isReplying)}
                                className="h-6 px-0 font-medium"
                            >
                                <MessageCircle className="w-3.5 h-3.5 mr-1" /> Reply
                            </Button>
                        )}

                        <span>{createdTime}</span>
                    </div>

                    {/* Form reply */}
                    {isReplying && (
                        <div className="mt-2 flex items-center gap-2">
                            <input
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Viết phản hồi..."
                                className="flex-1 rounded-xl border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <Button
                                size="sm"
                                onClick={handleReply}
                                className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    )}

                    {/* Bình luận con */}
                    {childComments.length > 0 && level < 2 && (
                        <div className="mt-2 space-y-1">
                            {visibleComments.map((child) => (
                                <CommentItem
                                    key={child._id}
                                    comment={child}
                                    level={level + 1}
                                    forumId={forumId}
                                    userId={userId}
                                    refresh={refresh}
                                />
                            ))}
                            {!showAll && hiddenCount > 0 && (
                                <button
                                    onClick={() => setShowAll(true)}
                                    className="text-blue-500 text-sm font-medium hover:underline ml-10 cursor-pointer"
                                >
                                    Show more {hiddenCount} replies
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Menu ba chấm */}
                <div className="relative">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-2 hover:bg-gray-100 rounded-full">
                                <MoreVertical className="h-5 w-5 text-gray-500" />
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-48">
                            {isMyComment ? (
                                <>
                                    <DropdownMenuItem
                                        className="text-blue-600 focus:text-blue-700"
                                        onClick={() => {
                                            setIsEditing(true);
                                        }}
                                    >
                                        <PenOffIcon className="w-4 h-4 mr-2" /> Edit comment
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-red-600 focus:text-red-700"
                                        onClick={handleDelete}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete comment
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <DropdownMenuItem
                                    className="text-yellow-600 focus:text-yellow-700"
                                    onClick={handleReport}
                                >
                                    <Flag className="w-4 h-4 mr-2" /> Report comment
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
