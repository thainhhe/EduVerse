import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import roomService from "@/services/roomService";
import { ToastHelper } from "@/helper/ToastHelper";

const EditRoom = ({ room, open, setOpen, onUpdated }) => {
  if (!room) return null;

  const [name, setName] = useState(room.name || "");
  const [link, setLink] = useState(room.link || "");
  const [status, setStatus] = useState(room.status || "public");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (room) {
      setName(room.name || "");
      setLink(room.link || "");
      setStatus(room.status || "public");
    }
  }, [room]);

  const handleSubmit = async () => {
    if (!room?._id) {
      ToastHelper.error("Không tìm thấy ID phòng.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = { name, link, status };
      console.log("Updating room:", room._id, payload);
      const res = await roomService.updateRoom(room._id, payload);
      console.log("Update response:", res);

      if (res && (res.success || res.status === 200)) {
        ToastHelper.success("Cập nhật phòng thành công!");
        onUpdated && onUpdated();
        setOpen(false);
      } else {
        ToastHelper.error(res?.message || "Cập nhật thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Update room error:", err);
      ToastHelper.error("Có lỗi xảy ra khi cập nhật.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Cập nhật phòng học</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Room Name */}
          <div>
            <label className="font-medium">Tên phòng</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên phòng..." />
          </div>

          {/* Link */}
          <div>
            <label className="font-medium">Link phòng</label>
            <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Nhập link Zoom/Meet..." />
          </div>

          {/* Status */}
          <div>
            <label className="font-medium">Trạng thái</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Công khai</SelectItem>
                <SelectItem value="private">Riêng tư</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditRoom;
