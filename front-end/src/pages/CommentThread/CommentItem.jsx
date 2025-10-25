"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp, MessageCircle, MoreHorizontal, Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { Avatar } from "@radix-ui/react-avatar"

export default function CommentItem({ comment, level, forumId, userId }) {
    const [likes, setLikes] = useState(comment.likes || 0)
    const [userLiked, setUserLiked] = useState(false)
    const [isReplying, setIsReplying] = useState(false)
    const [replyContent, setReplyContent] = useState("")
    const [childComments, setChildComments] = useState(comment.childComments || [])
    const [showAll, setShowAll] = useState(false);
    const MAX_PREVIEW = 0; // hiển thị 2 phản hồi đầu
    const visibleComments = showAll ? childComments : childComments.slice(0, MAX_PREVIEW);
    const hiddenCount = childComments.length - MAX_PREVIEW;
    const toggleLike = () => {
        setUserLiked((prev) => !prev)
        setLikes((prev) => (userLiked ? prev - 1 : prev + 1))
    }

    const handleReply = async () => {
        if (!replyContent.trim()) return
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
            })
            const data = await res.json()
            if (data.status === 200 || data.success) {
                setChildComments((prev) => [...prev, data.data])
                setReplyContent("")
                setIsReplying(false)
            }
        } catch (err) {
            console.error("Reply failed", err)
        }
    }

    const getInitial = (name) => {
        if (!name || typeof name !== 'string') return '?';
        return name.charAt(0).toUpperCase();
    };

    const userName = comment.userId?.email?.split("@")[0] || "Unknown"
    const createdTime = formatDistanceToNow(new Date(comment.createdAt), {
        addSuffix: true,
        locale: vi,
    })

    return (
        <div className={`${level > 0 ? "ml-6 border-l border-gray-200 pl-4" : ""}`}>
            {/* Comment Item */}
            <div className="flex gap-3 py-3">
                <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                    <Avatar>
                        {getInitial(comment?.userId?.email)}
                    </Avatar>

                </div>

                <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
                        <div className="font-semibold text-sm">{userName}</div>
                        <div className="text-sm mt-1">{comment.content}</div>
                    </div>

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

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsReplying(!isReplying)}
                            className="h-6 px-0 font-medium"
                        >
                            <MessageCircle className="w-3.5 h-3.5 mr-1" /> Reply
                        </Button>

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



                    {/* Hiển thị các comment con */}
                    {childComments.length > 0 && level < 2 && (() => {
                        return (
                            <div className="mt-2 space-y-1">
                                {visibleComments.map((child) => (
                                    <CommentItem
                                        key={child._id}
                                        comment={child}
                                        level={level + 1}
                                        forumId={forumId}
                                        userId={userId}
                                    />
                                ))}

                                {/* Nút xem thêm */}
                                {!showAll && hiddenCount > 0 && (
                                    <button
                                        onClick={() => setShowAll(true)}
                                        className="text-blue-500 text-sm font-medium hover:underline ml-10 cursor-pointer"
                                    >
                                        Xem thêm {hiddenCount} phản hồi khác
                                    </button>
                                )}
                            </div>
                        );
                    })()}

                </div>

                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}
