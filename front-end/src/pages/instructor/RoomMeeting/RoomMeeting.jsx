import React, { useState, useEffect, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import roomService from "@/services/roomService";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Edit, Plus } from "lucide-react";
import { ToastHelper } from "@/helper/ToastHelper";
import { ConfirmationHelper } from "@/helper/ConfirmationHelper";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EditRoom from "./EditRoom";

const RoomMeeting = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");
    const [newRoomLink, setNewRoomLink] = useState("");
    const params = useParams();
    const location = useLocation();
    const { user } = useAuth();
    const [statusFilter, setStatusFilter] = useState("all");
    const [editingRoom, setEditingRoom] = useState(null);
    const [openEdit, setOpenEdit] = useState(false);

    const getCourseIdFromQuery = () => {
        try {
            const qp = new URLSearchParams(location.search);
            console.log("qp", qp);
            return qp.get("courseId");
        } catch {
            return null;
        }
    };

    const storageCourseId = typeof window !== "undefined" ? sessionStorage.getItem("currentCourseId") : null;
    const courseId =
        params?.courseId ??
        location?.state?.id ??
        location?.state?.courseId ??
        getCourseIdFromQuery() ??
        storageCourseId ??
        null;

    const fetchRooms = async () => {
        if (!courseId) {
            setRooms([]);
            return;
        }
        setLoading(true);
        try {
            const res = await roomService.getRoomsByCourse(courseId);
            const data = res?.data?.data ?? res?.data ?? res ?? [];
            setRooms(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch rooms:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, [courseId]);

    const handleCreateRoom = async () => {
        if (!newRoomName) {
            ToastHelper.error("Vui lòng nhập tên phòng.");
            return;
        }
        if (!courseId) {
            ToastHelper.error(
                "Không tìm thấy courseId. Mở trang này từ trang quản lý khóa học hoặc điều hướng kèm state: { id: <courseId> } hoặc ?courseId=<id>."
            );
            return;
        }
        if (!user) {
            ToastHelper.info("Bạn cần đăng nhập để tạo phòng.");
            return;
        }

        try {
            const payload = {
                name: newRoomName,
                link: newRoomLink,
                courseId: courseId,
                createdBy: user._id ?? user.id ?? user.userId,
            };
            const res = await roomService.createRoom(payload);
            if (res.success) {
                const created = res?.data?.data ?? res?.data ?? res;
                setRooms((prev) => (Array.isArray(prev) ? [created, ...prev] : [created]));
                setNewRoomName("");
                setNewRoomLink("");
                const link = created?.link ?? created?.url ?? created?.meetingUrl ?? null;
                if (link) {
                    window.open(link, "_blank");
                } else {
                    ToastHelper.info("Phòng đã tạo. Bấm 'Join' ở bên phải để mở phòng (nếu có link).");
                }
            } else {
                ToastHelper.error("Đã xảy ra lỗi, vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Failed to create room:", error);
            ToastHelper.error("Tạo phòng thất bại. Kiểm tra console.");
        }
    };

    const handleDeleteRoom = async (roomId) => {
        try {
            await roomService.deleteRoom(roomId);
            ToastHelper.success("Đã xóa phòng.");
            fetchRooms();
        } catch (error) {
            console.error("Failed to delete room:", error);
            ToastHelper.error("Xóa thất bại. Kiểm tra console.");
        }
    };

    const filteredRooms = useMemo(() => {
        return rooms.filter((room) => {
            if (statusFilter === "all") return true;
            return room.status === statusFilter;
        });
    }, [rooms, statusFilter]);

    return (
        <div className="w-full mx-auto">
            <div className="border-b-indigo-600 border-b-2 pb-4 mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Quản lý Phòng học</h2>
            </div>
            {!courseId && (
                <div className="mb-4 p-3 rounded bg-yellow-50 text-sm text-yellow-800 border border-yellow-300">
                    Không tìm thấy <strong>courseId</strong>. Vui lòng mở từ trang khóa học hoặc truyền state/query.
                </div>
            )}
            <div className="flex flex-col items-center md:flex-row gap-2 mb-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả ({filteredRooms.length})</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                </Select>
                <Input
                    placeholder="Tên phòng (VD: Buổi Zoom tuần 1)"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="flex-1"
                />
                <Button onClick={handleCreateRoom} className="bg-indigo-600 text-white hover:bg-indigo-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo phòng
                </Button>
            </div>

            {/* Rooms List */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto mt-2p-1space-y-2scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
                {loading && <p>Đang tải danh sách phòng...</p>}

                {!loading && rooms.length === 0 && <div className="text-gray-500 italic">Chưa có phòng nào.</div>}

                {!loading &&
                    filteredRooms.map((room) => {
                        const id = room._id ?? room.id;
                        const link = room.link ?? room.url ?? room.meetingUrl ?? "";

                        return (
                            <div
                                key={id}
                                className="
                                flex justify-between items-center 
                                p-4 rounded-lg border 
                                bg-white shadow-sm hover:shadow-md 
                                transition-all
                            "
                            >
                                {/* Room Info */}
                                <div>
                                    <div className="font-semibold text-lg">{room.name}</div>

                                    {link ? (
                                        <a
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-indigo-600 hover:underline break-all"
                                        >
                                            {link}
                                        </a>
                                    ) : (
                                        <p className="text-sm text-gray-500">Chưa có link</p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => link && window.open(link, "_blank")}
                                    >
                                        Join
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setEditingRoom(room);
                                            setOpenEdit(true);
                                        }}
                                    >
                                        <Edit className="h-4 w-4 text-blue-600" />
                                    </Button>

                                    <ConfirmationHelper
                                        trigger={
                                            <Button variant="ghost" size="icon">
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        }
                                        onConfirm={() => handleDeleteRoom(id)}
                                    />
                                </div>
                            </div>
                        );
                    })}
            </div>
            {editingRoom && (
                <EditRoom room={editingRoom} open={openEdit} setOpen={setOpenEdit} onUpdated={fetchRooms} />
            )}
        </div>
    );
};

export default RoomMeeting;
