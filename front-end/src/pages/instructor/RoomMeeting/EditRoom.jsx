import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import roomService from "@/services/roomService";
import { ToastHelper } from "@/helper/ToastHelper";
import { useAuth } from "@/hooks/useAuth";

const EditRoom = ({ room, open, setOpen, onUpdated }) => {
    const { user } = useAuth();
    const [errors, setErrors] = useState({});
    if (!room) return null;

    // Normalize room name: trim and collapse multiple spaces
    const normalizeRoomName = (field) => {
        const normalized = (formData[field] || "").trim().replace(/\s+/g, " ");
        if (normalized !== formData[field]) {
            setFormData((prev) => ({ ...prev, [field]: normalized }));
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const [formData, setFormData] = useState({
        name: room.name || "",
        description: room.description || "",
        password: room.password || "",
        isPublic: room.isPublic || false,
        status: room.status || "pending",
        startTime: room.startTime ? new Date(room.startTime).toISOString().slice(0, 16) : "",
        endTime: room.endTime ? new Date(room.endTime).toISOString().slice(0, 16) : "",
    });
    const [submitting, setSubmitting] = useState(false);
    console.log("formData", formData);
    useEffect(() => {
        if (room) {
            setFormData({
                name: room.name || "",
                description: room.description || "",
                password: room.password || "",
                isPublic: room.isPublic || false,
                status: room.status || "pending",
                startTime: room.startTime ? new Date(room.startTime).toISOString().slice(0, 16) : "",
                endTime: room.endTime ? new Date(room.endTime).toISOString().slice(0, 16) : "",
            });
        }
    }, [room]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!room?._id) {
            ToastHelper.error("Room ID not found.");
            return;
        }

        // Normalize name before validation
        normalizeRoomName("name");

        // Validation
        const newErrors = {};

        const trimmedName = formData.name;
        if (!trimmedName) {
            newErrors.name = "Room name is required";
        } else if (trimmedName.length < 3) {
            newErrors.name = "Room name must be at least 3 characters";
        } else if (trimmedName.length > 200) {
            newErrors.name = "Room name must be at most 200 characters";
        }

        if (formData.startTime && formData.endTime) {
            if (new Date(formData.startTime) >= new Date(formData.endTime)) {
                newErrors.startTime = "Start time must be before end time";
                newErrors.endTime = "End time must be after start time";
            }
        }

        if (!user) {
            ToastHelper.error("Please login to create a room.");
            return;
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                password: formData.password,
                isPublic: formData.isPublic,
                status: formData.status,
                startTime: formData.startTime ? new Date(formData.startTime).toISOString() : null,
                endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
            };

            const res = await roomService.updateRoom(room._id, payload);

            if (res && (res.success || res.status === 200)) {
                ToastHelper.success("Room updated successfully!");
                onUpdated && onUpdated();
                setOpen(false);
            } else {
                ToastHelper.error(res?.message || "Failed to update room. Please try again.");
            }
        } catch (err) {
            console.error("Update room error:", err);
            ToastHelper.error("Failed to update room. Please check console.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Room</DialogTitle>
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
                            onBlur={() => normalizeRoomName("name")}
                            placeholder="Enter room name..."
                            className="mt-1"
                        />
                        {errors.name && <p className="text-red-500 mt-1">{errors.name}</p>}
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
                            onBlur={() => normalizeRoomName("description")}
                            placeholder="Enter room description..."
                            className="mt-1"
                            rows={3}
                        />
                        {errors.description && <p className="text-red-500 mt-1">{errors.description}</p>}
                    </div>

                    <div>
                        <Label htmlFor="password" className="font-medium">
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="text"
                            value={formData.password}
                            onChange={(e) => handleChange("password", e.target.value)}
                            onBlur={() => normalizeRoomName("password")}
                            placeholder="Enter room password (optional)..."
                            className="mt-1"
                        />
                        {errors.password && <p className="text-red-500 mt-1">{errors.password}</p>}
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
                                onChange={(e) => handleChange("startTime", e.target.value)}
                                className="mt-1"
                            />
                            {errors.startTime && <p className="text-red-500 mt-1">{errors.startTime}</p>}
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
                                onChange={(e) => handleChange("endTime", e.target.value)}
                                className="mt-1"
                            />
                            {errors.endTime && <p className="text-red-500 mt-1">{errors.endTime}</p>}
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <Label htmlFor="status" className="font-medium">
                            Room Status
                        </Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => handleChange("status", value)}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="ongoing">Ongoing</SelectItem>
                                <SelectItem value="ended">Ended</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && <p className="text-red-500 mt-1">{errors.status}</p>}
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
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditRoom;
