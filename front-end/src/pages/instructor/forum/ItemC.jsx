import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageCircle, Send, Trash2, Check, X, MoreVertical, EyeOff, Edit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Avatar } from "@radix-ui/react-avatar";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ConfirmationHelper } from "@/helper/ConfirmationHelper";
import { ToastHelper } from "@/helper/ToastHelper";
import { commentService } from "@/services/comment";
export default function CommentItem({ comment, level, forumId, userId, refresh, isMainInstructor, isCollab }) {
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
        if (!isMyComment && !isMainInstructor && !isCollab) {
            return ToastHelper.error("Bạn không có quyền!");
        }
        if (!replyContent.trim()) return ToastHelper.info("Vui lòng nhập nội dung phản hồi!");
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
                ToastHelper.error(data.message || "Không thể gửi phản hồi!");
            }
        } catch (err) {
            console.error("Reply failed:", err);
            ToastHelper.error("Có lỗi khi gửi phản hồi.");
        }
    };

    // 🟢 Xóa bình luận
    const handleDelete = async () => {
        if (!isMyComment && !isMainInstructor && !isCollab) {
            return ToastHelper.error("Bạn không có quyền!");
        }
        try {
            const res = await fetch(`http://localhost:9999/api/v1/comment/${comment._id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });
            const data = await res.json();
            if (res.ok) {
                ToastHelper.success("Đã xóa bình luận");
                setShowMenu(false);
                refresh();
            } else {
                ToastHelper.error("Không thể xóa bình luận");
            }
        } catch (err) {
            console.error("Delete failed:", err);
            ToastHelper.error("Có lỗi khi xóa bình luận.");
        }
    };

    // 🟢 Cập nhật bình luận
    const handleUpdate = async () => {
        if (!isMyComment && !isMainInstructor && !isCollab) {
            return ToastHelper.error("Bạn không có quyền!");
        }
        if (!editContent.trim()) return ToastHelper.info("Nội dung bình luận không được để trống");
        try {
            const res = await fetch(`http://localhost:9999/api/v1/comment/${comment._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, content: editContent }),
            });
            const data = await res.json();
            console.log("data", data);
            if (data.status === 200 || data.success) {
                console.log("hello");
                ToastHelper.success("Cập nhật bình luận thành công!");
                comment.content = editContent;
                setIsEditing(false);
                console.log("isEditing", isEditing);
                setShowMenu(false);
            } else {
                ToastHelper.error(data.message || "Cập nhật thất bại!");
            }
        } catch (err) {
            console.error("Update failed:", err);
            ToastHelper.error("Có lỗi khi cập nhật bình luận.");
        }
    };

    // 🟢 Báo cáo bình luận
    const handleReport = async () => {
        const reason = prompt("Lý do báo cáo bình luận này:");
        if (!reason) return;
        try {
            const res = await fetch(`http://localhost:9999/api/v1/comment/${comment._id}/report`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, reason }),
            });
            const data = await res.json();
            alert(data.message || "Đã gửi báo cáo");
            setShowMenu(false);
        } catch (err) {
            console.error("Report failed:", err);
            alert("Có lỗi khi gửi báo cáo.");
        }
    };

    const handleHideComment = async (id) => {
        if (!isMyComment && !isMainInstructor && !isCollab) {
            return ToastHelper.error("Bạn không có quyền!");
        }
        try {
            const res = await commentService.hiddenComment(id);
            if (res.success) {
                setShowMenu(false);
                ToastHelper.info("Da an Comment");
                refresh();
            }
        } catch (err) {
            console.error("Report failed:", err);
            ToastHelper.error(err?.response?.data?.message);
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
        <div className={`${level > 0 ? "border-l border-gray-200 pl-2" : ""}`}>
            <div className="flex gap-2 py-3">
                <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                    <Avatar>{getInitial(comment?.userId?.email)}</Avatar>
                </div>
                <div className="flex-1">
                    <div className="bg-gray-200 dark:bg-gray-800 rounded-md px-4 py-2">
                        <div className="font-semibold text-sm flex gap-2">
                            <span>{userName}</span>{" "}
                            <span
                                className={`${
                                    comment.status === "visible"
                                        ? "text-green-500"
                                        : comment.status === "deleted"
                                        ? "text-red-500"
                                        : "text-gray-500"
                                }`}
                            >
                                {comment.status}
                            </span>
                            {isMainInstructor && comment.reported.length > 0 && (
                                <p className="text-red-600 mx-2">{comment.reported.length} báo cáo</p>
                            )}
                        </div>
                        {/* Nếu đang chỉnh sửa */}
                        {isEditing ? (
                            <div className="mt-2">
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    rows={1}
                                    className="w-full text-sm border border-indigo-600 rounded-lg px-2 py-1"
                                />
                                <div className="flex gap-2 mt-2">
                                    <Button
                                        size="sm"
                                        onClick={handleUpdate}
                                        className="border border-green-600 bg-white text-black hover:bg-green-600 hover:text-white"
                                    >
                                        <Check className="w-4 h-4 mr-1" /> Lưu
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="border border-red-600 bg-white text-black hover:bg-red-600 hover:text-white"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditContent(comment.content);
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
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
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

                        {showAll && (
                            <button
                                onClick={() => setShowAll(false)}
                                className="text-blue-500 text-sm font-medium hover:underline ml-2 cursor-pointer"
                            >
                                Ẩn bình luận
                            </button>
                        )}
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
                                    isMainInstructor={isMainInstructor}
                                />
                            ))}
                            {!showAll && hiddenCount > 0 && (
                                <button
                                    onClick={() => setShowAll(true)}
                                    className="text-blue-500 text-sm font-medium hover:underline ml-2 cursor-pointer"
                                >
                                    Xem thêm {hiddenCount} phản hồi khác
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Menu ba chấm */}
                {comment.status !== "deleted" && (
                    <div className="relative">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="p-2 hover:bg-gray-100 rounded-full">
                                    <MoreVertical className="h-5 w-5 text-gray-500" />
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="w-48">
                                {isMyComment || isMainInstructor || isCollab ? (
                                    <>
                                        <DropdownMenuItem
                                            className="text-blue-600 focus:text-blue-700 cursor-pointer"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            <Edit className="w-4 h-4 mr-2" /> Chỉnh sửa bình luận
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            asChild
                                            className="text-red-600 focus:text-red-700 cursor-pointer p-0"
                                        >
                                            <ConfirmationHelper
                                                trigger={
                                                    <div className="w-full flex items-center px-2 py-2 cursor-pointer text-gray-600">
                                                        <EyeOff className="w-4 h-4 mr-2" /> Ẩn bình luận
                                                    </div>
                                                }
                                                title="Ẩn bình luận?"
                                                description="Hành động này không thể hoàn tác."
                                                confirmText="Ẩn"
                                                onConfirm={() => handleHideComment(comment?._id)}
                                            />
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            asChild
                                            className="text-red-600 focus:text-red-700 cursor-pointer p-0"
                                        >
                                            <ConfirmationHelper
                                                trigger={
                                                    <div className="w-full flex items-center px-2 py-2">
                                                        <Trash2 className="w-4 h-4 mr-2" /> Xóa bình luận
                                                    </div>
                                                }
                                                title="Xóa bình luận?"
                                                description="Hành động này không thể hoàn tác."
                                                confirmText="Xóa"
                                                onConfirm={handleDelete}
                                            />
                                        </DropdownMenuItem>
                                    </>
                                ) : (
                                    <>
                                        {/* user bình thường chỉ được ẩn + report */}
                                        <DropdownMenuItem asChild className="text-red-600 focus:text-red-700">
                                            <ConfirmationHelper
                                                trigger={
                                                    <button className="w-full flex items-center text-gray-600">
                                                        <EyeOff className="w-4 h-4 mx-2" /> Ẩn bình luận
                                                    </button>
                                                }
                                                title="Ẩn bình luận?"
                                                description="Hành động này không thể hoàn tác."
                                                confirmText="Ẩn"
                                                onConfirm={() => handleHideComment(comment?._id)}
                                            />
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>
        </div>
    );
}
