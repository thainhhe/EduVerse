import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import roomService from "@/services/roomService";
import { ToastHelper } from "@/helper/ToastHelper";
import { useAuth } from "@/hooks/useAuth";

const AddRoom = ({ open, setOpen, courseId, onCreated }) => {
  const { user } = useAuth();
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    password: "",
    isPublic: false,
    startTime: "",
    endTime: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Normalize room name: trim and collapse multiple spaces
  const normalizeRoomName = () => {
    const normalized = (formData.name || "").trim().replace(/\s+/g, " ");
    if (normalized !== formData.name) {
      setFormData((prev) => ({ ...prev, name: normalized }));
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const getNowDate = () => {
    const now = new Date();
    now.setSeconds(0, 0); // bỏ giây & ms cho khỏi lệch
    return now.toISOString().slice(0, 16);
  };
  // console.log("getNowDate()", getNowDate());

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      password: "",
      isPublic: false,
      startTime: "",
      endTime: "",
    });
  };

  const handleSubmit = async () => {
    // Normalize name before validation
    const normalizedName = (formData.name || "").trim().replace(/\s+/g, " ");
    if (normalizedName !== formData.name) {
      setFormData((prev) => ({ ...prev, name: normalizedName }));
    }

    // Validation
    const newErrors = {};

    const trimmedName = normalizedName;
    if (!trimmedName) {
      newErrors.name = "Room name is required";
    } else if (trimmedName.length < 3) {
      newErrors.name = "Room name must be at least 3 characters";
    } else if (trimmedName.length > 200) {
      newErrors.name = "Room name must be at most 200 characters";
    }

    /* ✅ So sánh thời gian (chỉ chạy khi cả 2 có giá trị) */
    if (formData.startTime && formData.endTime) {
      if (new Date(formData.startTime) >= new Date(formData.endTime)) {
        newErrors.startTime = "Start time must be before end time";
        newErrors.endTime = "End time must be after start time";
      }
    }

    if (!courseId) {
      ToastHelper.error("Course ID is required.");
      return;
    }

    if (!user) {
      ToastHelper.error("Please login to create a room.");
      return;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        password: formData.password,
        isPublic: formData.isPublic,
        courseId: courseId,
        createdBy: user._id ?? user.id ?? user.userId,
        startTime: formData.startTime
          ? new Date(formData.startTime).toISOString()
          : null,
        endTime: formData.endTime
          ? new Date(formData.endTime).toISOString()
          : null,
      };

      console.log("Creating room:", payload);
      const res = await roomService.createRoom(payload);
      console.log("Create response:", res);

      if (res && (res.success || res.status === 201)) {
        ToastHelper.success("Room created successfully!");
        resetForm();
        onCreated && onCreated();
        setOpen(false);
        // Auto open link if available
        const created = res?.data?.data ?? res?.data ?? res;
        const link =
          created?.link ?? created?.url ?? created?.meetingUrl ?? null;
        if (link) {
          window.open(link, "_blank");
        }
      } else {
        ToastHelper.error(
          res?.data.message || "Failed to create room. Please try again."
        );
      }
    } catch (err) {
      console.error("Create room error:", err);
      ToastHelper.error(
        err?.response?.data.errors[0] ||
          "Failed to create room. Please try again."
      );
      // ToastHelper.error("Failed to create room. Please check console.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Room</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Room Name */}
          <div>
            <Label htmlFor="name" className="font-medium">
              Room Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              onBlur={normalizeRoomName}
              placeholder="e.g., Week 1 Zoom Session"
              className="mt-1"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter room description..."
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Link */}
          {/* <div>
                        <Label htmlFor="link" className="font-medium">
                            Meeting Link
                        </Label>
                        <Input
                            id="link"
                            value={formData.link}
                            onChange={(e) => handleChange("link", e.target.value)}
                            placeholder="Enter meeting link (Zoom/Meet/Jitsi)..."
                            className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Leave empty to auto-generate a Jitsi link
                        </p>
                    </div> */}

          {/* Password */}
          <div>
            <Label htmlFor="password" className="font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="text"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="Enter room password (optional)..."
              className="mt-1"
            />
          </div>

          {/* Two columns for dates */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Time */}
            <div>
              <Label htmlFor="startTime" className="font-medium">
                Start Time
              </Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                min={getNowDate()}
                onChange={(e) => handleChange("startTime", e.target.value)}
                className="mt-1"
              />
              {errors.startTime && (
                <p className="text-sm text-red-500 mt-1">{errors.startTime}</p>
              )}
            </div>

            {/* End Time */}
            <div>
              <Label htmlFor="endTime" className="font-medium">
                End Time
              </Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                min={getNowDate()}
                onChange={(e) => handleChange("endTime", e.target.value)}
                className="mt-1"
              />
              {errors.endTime && (
                <p className="text-sm text-red-500 mt-1">{errors.endTime}</p>
              )}
            </div>
          </div>

          {/* Is Public Switch */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="isPublic" className="font-medium">
                Public Room
              </Label>
              <p className="text-sm text-gray-500">
                Allow anyone to join this room without authentication
              </p>
            </div>
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => handleChange("isPublic", checked)}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Creating..." : "Create Room"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddRoom;
