import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    ThumbsUp,
    MessageCircle,
    Send,
    Trash2,
    Check,
    X,
    MoreVertical,
    EyeOff,
    Edit,
    Flag,
    AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Avatar } from "@radix-ui/react-avatar";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConfirmationHelper } from "@/helper/ConfirmationHelper";
import { ToastHelper } from "@/helper/ToastHelper";
import { commentService } from "@/services/comment";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
export default function CommentItem({
    comment,
    level,
    forumId,
    userId,
    refresh,
    isMainInstructor,
    isCollab,
}) {
    const [likes, setLikes] = useState(comment.likes || 0);
    const [userLiked, setUserLiked] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [childComments, setChildComments] = useState(comment.childComments || []);
    const [showAll, setShowAll] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [showReportDialog, setShowReportDialog] = useState(false);

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
        <div
            className={cn(
                "group animate-in fade-in slide-in-from-bottom-2 duration-300",
                level > 0 && "ml-8 pl-4 border-l-2 border-gray-100"
            )}
        >
            <div className="flex gap-3 py-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-md ring-2 ring-white">
                        {getInitial(comment?.userId?.email)}
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                        {/* Content Bubble */}
                        <div className="flex-1 bg-gray-50/80 hover:bg-gray-100/80 transition-colors rounded-2xl rounded-tl-none px-5 py-3 border border-gray-100 shadow-sm">
                            {/* Header */}
                            <div className="flex items-center flex-wrap gap-2 mb-1">
                                <span className="font-bold text-sm text-gray-900 hover:text-indigo-600 cursor-pointer transition-colors">
                                    {userName}
                                </span>

                                {comment.status !== "visible" && (
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-[10px] px-2 py-0 h-5 font-normal border-0",
                                            comment.status === "deleted"
                                                ? "bg-red-50 text-red-600"
                                                : "bg-gray-100 text-gray-500"
                                        )}
                                    >
                                        {comment.status === "deleted" ? "Deleted" : "Hidden"}
                                    </Badge>
                                )}

                                {isMainInstructor && comment.reported && comment.reported.length > 0 && (
                                    <Badge
                                        variant="destructive"
                                        className="text-[10px] px-2 py-0 h-5 font-normal shadow-sm"
                                    >
                                        {comment.reported.length} Reported
                                    </Badge>
                                )}

                                <span className="text-xs text-gray-400 ml-auto font-medium">
                                    {createdTime}
                                </span>
                            </div>

                            {/* Content */}
                            {isEditing ? (
                                <div className="mt-2 space-y-2">
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        rows={2}
                                        className="w-full text-sm border border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg px-3 py-2 bg-white resize-none outline-none transition-all"
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setEditContent(comment.content);
                                            }}
                                            className="h-8 text-gray-500 hover:text-gray-700"
                                        >
                                            Hủy
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleUpdate}
                                            className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white"
                                        >
                                            Lưu thay đổi
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words">
                                    {comment.content}
                                </div>
                            )}
                        </div>

                        {/* Menu Trigger - Visible on Group Hover */}
                        {comment.status !== "deleted" && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pt-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full transition-colors focus:outline-none">
                                            <MoreVertical className="h-4 w-4" />
                                        </button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent
                                        className="w-56 p-1 bg-white/95 backdrop-blur-sm border-gray-100 shadow-lg rounded-xl"
                                        align="end"
                                        sideOffset={5}
                                    >
                                        {isMyComment || isMainInstructor || isCollab ? (
                                            <>
                                                <DropdownMenuItem
                                                    className="cursor-pointer rounded-lg focus:bg-indigo-50 focus:text-indigo-600 transition-colors"
                                                    onClick={() => setIsEditing(true)}
                                                >
                                                    <div className="flex items-center w-full gap-3 cursor-pointer">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                                            <Edit className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-medium text-sm cursor-pointer">
                                                            Chỉnh sửa
                                                        </span>
                                                    </div>
                                                </DropdownMenuItem>

                                                {comment.reported && comment.reported.length > 0 && (
                                                    <DropdownMenuItem
                                                        className="cursor-pointer rounded-lg focus:bg-orange-50 focus:text-orange-600 transition-colors mt-1"
                                                        onClick={() => setShowReportDialog(true)}
                                                    >
                                                        <div className="flex items-center w-full gap-3 cursor-pointer">
                                                            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                                                                <Flag className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex items-center justify-between flex-1 cursor-pointer">
                                                                <span className="font-medium text-sm">
                                                                    Xem báo cáo
                                                                </span>
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="h-5 px-1.5 text-[10px] bg-orange-100 text-orange-700 hover:bg-orange-200 border-0"
                                                                >
                                                                    {comment.reported.length}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </DropdownMenuItem>
                                                )}

                                                <DropdownMenuSeparator className="my-1 bg-gray-100" />

                                                <DropdownMenuItem className="cursor-pointer rounded-lg focus:bg-gray-100 focus:text-gray-700 transition-colors">
                                                    <ConfirmationHelper
                                                        trigger={
                                                            <div className="flex items-center w-full gap-3 cursor-pointer">
                                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                                                                    <EyeOff className="w-4 h-4" />
                                                                </div>
                                                                <span className="font-medium text-sm cursor-pointer">
                                                                    Ẩn bình luận
                                                                </span>
                                                            </div>
                                                        }
                                                        title="Ẩn bình luận?"
                                                        description="Hành động này không thể hoàn tác."
                                                        confirmText="Ẩn"
                                                        onConfirm={() => handleHideComment(comment?._id)}
                                                    />
                                                </DropdownMenuItem>

                                                <DropdownMenuItem className="cursor-pointer rounded-lg focus:bg-red-50 focus:text-red-600 transition-colors mt-1">
                                                    <ConfirmationHelper
                                                        trigger={
                                                            <div className="flex items-center w-full gap-3 text-red-600 cursor-pointer">
                                                                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </div>
                                                                <span className="font-medium text-sm cursor-pointer">
                                                                    Xóa bình luận
                                                                </span>
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
                                                <DropdownMenuItem
                                                    className="cursor-pointer rounded-lg focus:bg-orange-50 focus:text-orange-600 transition-colors"
                                                    onClick={handleReport}
                                                >
                                                    <div className="flex items-center w-full gap-3 cursor-pointer">
                                                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                                                            <Flag className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-medium text-sm cursor-pointer">
                                                            Báo cáo vi phạm
                                                        </span>
                                                    </div>
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator className="my-1 bg-gray-100" />

                                                <DropdownMenuItem className="cursor-pointer rounded-lg focus:bg-gray-100 focus:text-gray-700 transition-colors">
                                                    <ConfirmationHelper
                                                        trigger={
                                                            <div className="flex items-center w-full gap-3 cursor-pointer">
                                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                                                                    <EyeOff className="w-4 h-4" />
                                                                </div>
                                                                <span className="font-medium text-sm cursor-pointer">
                                                                    Ẩn bình luận
                                                                </span>
                                                            </div>
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

                    {/* Action Bar */}
                    <div className="flex items-center gap-4 mt-1 ml-1">
                        <button
                            onClick={toggleLike}
                            className={cn(
                                "flex items-center gap-1.5 text-xs font-medium transition-colors px-2 py-1 rounded-full hover:bg-gray-100",
                                userLiked ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <ThumbsUp className={cn("w-3.5 h-3.5", userLiked && "fill-current")} />
                            {likes > 0 ? likes : "Thích"}
                        </button>

                        {!isEditing && (
                            <button
                                onClick={() => setIsReplying(!isReplying)}
                                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 rounded-full hover:bg-gray-100"
                            >
                                <MessageCircle className="w-3.5 h-3.5" />
                                Phản hồi
                            </button>
                        )}

                        {showAll && (
                            <button
                                onClick={() => setShowAll(false)}
                                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline ml-auto"
                            >
                                Thu gọn
                            </button>
                        )}
                    </div>

                    {/* Reply Form */}
                    {isReplying && (
                        <div className="mt-3 flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
                            <div className="flex-1">
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Viết phản hồi của bạn..."
                                    rows={1}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none bg-white"
                                />
                            </div>
                            <Button
                                size="icon"
                                onClick={handleReply}
                                disabled={!replyContent.trim()}
                                className="h-9 w-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-sm flex-shrink-0"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    )}

                    {/* Child Comments */}
                    {childComments.length > 0 && level < 2 && (
                        <div className="mt-3 space-y-3">
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
                                    className="flex items-center gap-2 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline mt-1 ml-2"
                                >
                                    <div className="w-5 h-px bg-indigo-200"></div>
                                    Xem thêm {hiddenCount} phản hồi khác
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Report Dialog */}
            <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-orange-600">
                            <AlertTriangle className="h-5 w-5" />
                            Báo cáo vi phạm
                        </DialogTitle>
                        <DialogDescription>Danh sách các báo cáo cho bình luận này.</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[400px] mt-2 pr-4">
                        <div className="space-y-4">
                            {comment.reported?.map((report, index) => (
                                <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                                                {getInitial(report.userId?.email)}
                                            </Avatar>
                                            <span className="text-sm font-medium text-gray-700">
                                                {report.userId?.email?.split("@")[0] || "Người dùng"}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {formatDistanceToNow(new Date(report.createdAt || Date.now()), {
                                                addSuffix: true,
                                                locale: vi,
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 bg-white p-2 rounded border border-gray-100 italic">
                                        "{report.reason}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
}
