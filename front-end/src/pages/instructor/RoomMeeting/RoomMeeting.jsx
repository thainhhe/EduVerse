import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import roomService from "@/services/roomService";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Edit, Plus } from "lucide-react";

const RoomMeeting = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomLink, setNewRoomLink] = useState("");
  const params = useParams();
  const location = useLocation();
  const { user } = useAuth();

  // Try multiple fallbacks for courseId:
  const getCourseIdFromQuery = () => {
    try {
      const qp = new URLSearchParams(location.search);
      console.log("qp", qp)
      return qp.get("courseId");
    } catch {
      return null;
    }
  };

  // fallback from local storage (saved when user started editing the course)
  const storageCourseId =
    typeof window !== "undefined"
      ? sessionStorage.getItem("currentCourseId")
      : null;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const handleCreateRoom = async () => {
    if (!newRoomName) {
      alert("Vui lòng nhập tên phòng.");
      return;
    }
    if (!courseId) {
      alert(
        "Không tìm thấy courseId. Mở trang này từ trang quản lý khóa học hoặc điều hướng kèm state: { id: <courseId> } hoặc ?courseId=<id>."
      );
      return;
    }
    if (!user) {
      alert("Bạn cần đăng nhập để tạo phòng.");
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
      // normalize created room object
      const created = res?.data?.data ?? res?.data ?? res;
      // prepend to list so user sees it immediately
      setRooms((prev) =>
        Array.isArray(prev) ? [created, ...prev] : [created]
      );
      setNewRoomName("");
      setNewRoomLink("");

      // If server returned a meeting link, open it automatically in new tab
      const link = created?.link ?? created?.url ?? created?.meetingUrl ?? null;
      if (link) {
        window.open(link, "_blank");
      } else {
        // fallback: inform user and keep join button available
        alert("Phòng đã tạo. Bấm 'Join' ở bên phải để mở phòng (nếu có link).");
      }
    } catch (error) {
      console.error("Failed to create room:", error);
      alert("Tạo phòng thất bại. Kiểm tra console.");
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Bạn có chắc muốn xóa phòng này?")) return;
    try {
      await roomService.deleteRoom(roomId);
      fetchRooms();
    } catch (error) {
      console.error("Failed to delete room:", error);
      alert("Xóa thất bại. Kiểm tra console.");
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý Phòng học</CardTitle>
        </CardHeader>
        <CardContent>
          {!courseId && (
            <div className="mb-4 p-3 rounded bg-yellow-50 text-sm text-yellow-800">
              Không tìm thấy courseId. Hãy mở trang này từ trang khóa học
              (navigate with state: {"{ id: <courseId> }"}) hoặc thêm
              ?courseId=&lt;id&gt; vào URL.
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Tên phòng"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
            />

            <Button onClick={handleCreateRoom}>
              <Plus className="mr-2 h-4 w-4" /> Tạo
            </Button>
          </div>

          <div className="space-y-2">
            {loading && <p>Đang tải...</p>}
            {!loading && rooms.length === 0 && <p>Chưa có phòng nào.</p>}
            {rooms.map((room) => {
              const id = room._id ?? room.id;
              const link = room.link ?? room.url ?? room.meetingUrl ?? null;
              return (
                <div
                  key={id}
                  className="flex justify-between items-center p-3 border rounded-md"
                >
                  <div>
                    <h3 className="font-semibold">{room.name}</h3>
                    {link ? (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        {link}
                      </a>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No meeting link yet
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {/* Join button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (link) {
                          window.open(link, "_blank");
                        } else {
                          // fallback: open room detail route if available
                          const roomRoute = `/room/${id}`;
                          window.open(roomRoute, "_blank");
                        }
                      }}
                    >
                      Join
                    </Button>

                    <Button variant="ghost" size="icon" disabled>
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteRoom(id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomMeeting;
