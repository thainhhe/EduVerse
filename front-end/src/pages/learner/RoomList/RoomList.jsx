import { useEffect, useState } from "react";
import roomService from "@/services/roomService";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User, Video, Link as LinkIcon, BookOpen, Mail } from "lucide-react";

const RoomList = () => {
    const { user } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await roomService.getAllRooms();
                console.log("res", res);
                if (res.success) {
                    const data = res?.data?.data ?? res?.data ?? [];
                    setRooms(data);
                }
            } catch (err) {
                console.error("❌ Failed to fetch rooms:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-blue-50 py-10 px-6">
            <div className="max-w-5xl mx-auto">
                <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
                    <CardHeader className="text-center border-b border-gray-100 pb-6">
                        <CardTitle className="text-3xl font-bold text-gray-800 tracking-tight">
                            Ongoing Classrooms
                        </CardTitle>
                        <p className="text-gray-500 text-sm mt-1">
                            Join live online sessions now
                        </p>
                    </CardHeader>


                    <CardContent className="p-6">
                        {loading ? (
                            <p className="text-center text-gray-600 animate-pulse">
                                Đang tải danh sách phòng học...
                            </p>
                        ) : rooms.length === 0 ? (
                            <p className="text-center text-gray-500">
                                Chưa có phòng học nào được tạo.
                            </p>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-6">
                                {rooms.map((room) => (
                                    <div
                                        key={room._id}
                                        className="group relative overflow-hidden border border-gray-100 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300"
                                    >
                                        <div className="p-5 space-y-3">
                                            <p className="flex items-center gap-2">
                                                <Video className="h-5 w-5 text-indigo-500" />
                                                <span className=" text-lg font-medium text-gray-600">
                                                    Room name:
                                                </span>{" "}
                                                <span className="text-lg font-semibold flex items-center gap-2">
                                                    {room.name}
                                                </span>
                                            </p>

                                            <div className="space-y-2 text-gray-700 text-sm leading-relaxed">
                                                <p className="flex items-start gap-2 text-gray-700">
                                                    <BookOpen className="w-4 h-4 text-indigo-500 mt-1" />
                                                    <span className="font-medium text-gray-600 min-w-[40px]">Course:</span>
                                                    <span className="flex-1 leading-snug break-words">
                                                        {room.courseId?.title || "Không xác định"}
                                                    </span>
                                                </p>

                                                <p className="flex items-center gap-2">
                                                    <User className="h-4 w-4  text-indigo-500" />
                                                    <span className="font-medium text-gray-600">
                                                        Created By:
                                                    </span>{" "}
                                                    {room.createdBy?.username || "Không rõ"}
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4  text-indigo-500" />
                                                    <span className="font-medium text-gray-600">
                                                        Email:
                                                    </span>{" "}
                                                    {room.createdBy?.email || "Không rõ"}
                                                </p>

                                                <p className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4  text-indigo-500" />
                                                    <span className="font-medium text-gray-600">
                                                        Time:
                                                    </span>{" "}
                                                    {room.startTime
                                                        ? new Date(room.startTime).toLocaleString("vi-VN")
                                                        : "Chưa xác định"}
                                                </p>

                                                <p className="flex items-center gap-2">
                                                    <LinkIcon className="h-4 w-4 text-indigo-500" />
                                                    <span className="font-medium text-gray-600">Link: </span>
                                                    {room.link ? (
                                                        <p className="flex items-center gap-2 break-all">

                                                            <a
                                                                href={room.link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-all"
                                                            >
                                                                {room.link}
                                                            </a>
                                                        </p>
                                                    ) : (
                                                        <p className="text-sm text-gray-400">
                                                            Chưa có link học
                                                        </p>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {room.link && (
                                            <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
                                                <Button
                                                    onClick={() => window.open(room.link, "_blank")}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 transition-transform transform hover:scale-105"
                                                >
                                                    Tham gia ngay
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default RoomList;
