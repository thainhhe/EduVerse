"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
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
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { Avatar } from "@radix-ui/react-avatar"

export default function CommentItem({ comment, level, forumId, userId, refresh }) {
    const [likes, setLikes] = useState(comment.likes || 0)
    const [userLiked, setUserLiked] = useState(false)
    const [isReplying, setIsReplying] = useState(false)
    const [replyContent, setReplyContent] = useState("")
    const [childComments, setChildComments] = useState(comment.childComments || [])
    const [showAll, setShowAll] = useState(false)
    const [showMenu, setShowMenu] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(comment.content)

    const MAX_PREVIEW = 0
    const visibleComments = showAll ? childComments : childComments.slice(0, MAX_PREVIEW)
    const hiddenCount = childComments.length - MAX_PREVIEW

    const toggleLike = () => {
        setUserLiked((prev) => !prev)
        setLikes((prev) => (userLiked ? prev - 1 : prev + 1))
    }

    // 🟢 Gửi phản hồi
    const handleReply = async () => {
        if (!replyContent.trim()) return alert("Vui lòng nhập nội dung phản hồi!")
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
            if (res.ok && (data.status === 200 || data.success)) {
                setChildComments((prev) => [...prev, data.data])
                setReplyContent("")
                setIsReplying(false)
            } else {
                alert(data.message || "Không thể gửi phản hồi!")
            }
        } catch (err) {
            console.error("Reply failed:", err)
            alert("Có lỗi khi gửi phản hồi.")
        }
    }

    // 🟢 Xóa bình luận
    const handleDelete = async () => {
        if (!window.confirm("Bạn có chắc muốn xóa bình luận này không?")) return
        try {
            const res = await fetch(`http://localhost:9999/api/v1/comment/${comment._id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            })
            const data = await res.json()
            if (res.ok) {
                alert(data.message || "Đã xóa bình luận")
                setShowMenu(false)
                refresh()
            } else {
                alert(data.message || "Không thể xóa bình luận")
            }
        } catch (err) {
            console.error("Delete failed:", err)
            alert("Có lỗi khi xóa bình luận.")
        }
    }

    // 🟢 Cập nhật bình luận
    const handleUpdate = async () => {
        if (!editContent.trim()) return alert("Nội dung bình luận không được để trống")
        try {
            const res = await fetch(`http://localhost:9999/api/v1/comment/${comment._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, content: editContent }),
            })
            const data = await res.json()
            console.log("data", data)
            if ((data.status === 200 || data.success)) {
                console.log("hello")
                alert("Cập nhật bình luận thành công!")
                comment.content = editContent
                setIsEditing(false)
                console.log("isEditing", isEditing)
                setShowMenu(false)
            } else {
                alert(data.message || "Cập nhật thất bại!")
            }

        } catch (err) {
            console.error("Update failed:", err)
            alert("Có lỗi khi cập nhật bình luận.")
        }
    }

    // 🟢 Báo cáo bình luận
    const handleReport = async () => {
        const reason = prompt("Lý do báo cáo bình luận này:")
        if (!reason) return
        try {
            const res = await fetch(
                `http://localhost:9999/api/v1/comment/${comment._id}/report`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, reason }),
                }
            )
            const data = await res.json()
            alert(data.message || "Đã gửi báo cáo")
            setShowMenu(false)
        } catch (err) {
            console.error("Report failed:", err)
            alert("Có lỗi khi gửi báo cáo.")
        }
    }

    const getInitial = (name) =>
        name && typeof name === "string" ? name.charAt(0).toUpperCase() : "?"
    const userName = comment.userId?.email?.split("@")[0] || "Người dùng"
    const isMyComment = comment.userId?._id === userId
    const createdTime = formatDistanceToNow(new Date(comment.createdAt), {
        addSuffix: true,
        locale: vi,
    })

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
                                        <Check className="w-4 h-4 mr-1" /> Lưu
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setIsEditing(false)
                                            setEditContent(comment.content)
                                        }}
                                    >
                                        <X className="w-4 h-4 mr-1" /> Hủy
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
                            className={`h-6 px-0 font-medium ${userLiked ? "text-blue-600" : ""
                                }`}
                        >
                            <ThumbsUp
                                className={`w-3.5 h-3.5 mr-1 ${userLiked ? "fill-current" : ""}`}
                            />
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
                                    Xem thêm {hiddenCount} phản hồi khác
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Menu ba chấm */}
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground"
                        onClick={() => setShowMenu(!showMenu)}
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </Button>

                    {showMenu && (
                        <div className="absolute right-0 top-6 bg-white shadow-lg rounded-md text-sm border border-gray-200 z-10">
                            {isMyComment ? (
                                <>
                                    <button
                                        onClick={handleDelete}
                                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" /> Xóa bình luận
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(true)
                                            setShowMenu(false)
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-blue-600"
                                    >
                                        <PenOffIcon className="w-4 h-4" /> Chỉnh sửa bình luận
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleReport}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-yellow-600"
                                >
                                    <Flag className="w-4 h-4" /> Báo cáo bình luận
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
