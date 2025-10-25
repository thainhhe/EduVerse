"use client"
import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import CommentItem from "./CommentItem"

// export default function CommentThread({ forumId, userId }) {
export default function CommentThread({ forumId = "68fa572f5f8ebe11af185547", userId = "68fc9c79e9b3adbc7801ad9e" }) {
    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(false)
    const [newComment, setNewComment] = useState("")

    // 🔹 Load danh sách bình luận
    const fetchComments = async () => {
        setLoading(true)
        try {
            const res = await fetch(`http://localhost:9999/api/v1/comment/forum/${forumId}`)
            const json = await res.json()
            setComments(json.data || [])
        } catch (err) {
            console.error("Failed to load comments", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (forumId) fetchComments()
    }, [forumId])

    // 🔹 Thêm bình luận gốc
    const handleCreateComment = async () => {
        if (!newComment.trim()) return

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
            })

            const data = await res.json()
            if (data.status === 200 || data.success) {
                setComments((prev) => [data.data, ...prev]) // chèn mới vào đầu
                setNewComment("")
            } else {
                alert("Không thể gửi bình luận!")
            }
        } catch (err) {
            console.error(err)
        }
    }

    console.log("comment", comments)
    return (
        <div className="max-w-3xl mx-auto space-y-5">
            {/* Ô nhập bình luận gốc */}
            <div className="flex items-center gap-2">
                <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Viết bình luận của bạn..."
                    className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <Button
                    size="sm"
                    onClick={handleCreateComment}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                    <Send className="w-4 h-4" />
                </Button>
            </div>

            {/* Danh sách bình luận */}
            {loading ? (
                <p className="text-gray-500 text-sm italic">Đang tải bình luận...</p>
            ) : comments.length > 0 ? (
                comments.map((c) => (
                    <CommentItem
                        key={c._id}
                        comment={c}
                        level={0}
                        forumId={forumId}
                        userId={userId}
                    />
                ))
            ) : (
                <p className="text-gray-500 text-sm italic">Chưa có bình luận nào</p>
            )}
        </div>
    )
}
