import React, { useState, useEffect, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import roomService from "@/services/roomService";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Trash2, Edit, Plus, Lock } from "lucide-react";
import { ToastHelper } from "@/helper/ToastHelper";
import { ConfirmationHelper } from "@/helper/ConfirmationHelper";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EditRoom from "./EditRoom";
import AddRoom from "./AddRoom";

const RoomMeeting = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const location = useLocation();
    const [statusFilter, setStatusFilter] = useState("all");
    const [editingRoom, setEditingRoom] = useState(null);
    const [openEdit, setOpenEdit] = useState(false);

    // const { draft } = useCourse();
    // console.log("draft", draft)
    // const isApproved = draft.status === "approve";

    const rawCourseData = typeof window !== "undefined" ? sessionStorage.getItem("currentCourseData") : null;
    const sessionCourseData = rawCourseData ? JSON.parse(rawCourseData) : null;
    const isApproved = sessionCourseData?.status === "approve";
    console.log("isApproved", isApproved)

    // Create room dialog state
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    // Password dialog state
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [enteredPassword, setEnteredPassword] = useState("");

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

    const handleDeleteRoom = async (roomId) => {
        try {
            await roomService.deleteRoom(roomId);
            ToastHelper.success("Room deleted successfully.");
            fetchRooms();
        } catch (error) {
            console.error("Failed to delete room:", error);
            ToastHelper.error("Failed to delete room. Please check console.");
        }
    };

    const handleJoinRoom = (room) => {
        const link = room.link ?? room.url ?? room.meetingUrl ?? "";

        if (!link) {
            ToastHelper.error("No meeting link available for this room.");
            return;
        }

        // Check if room has password
        if (room.password && room.password.trim() !== "") {
            // Show password dialog
            setSelectedRoom(room);
            setEnteredPassword("");
            setPasswordDialogOpen(true);
        } else {
            // No password, join directly
            window.open(link, "_blank");
        }
    };

    const handlePasswordSubmit = () => {
        if (!selectedRoom) return;

        // Validate password
        if (enteredPassword.trim() === "") {
            ToastHelper.error("Please enter the password.");
            return;
        }

        if (enteredPassword !== selectedRoom.password) {
            ToastHelper.error("Incorrect password. Please try again.");
            setEnteredPassword("");
            return;
        }

        // Password correct, join the room
        const link = selectedRoom.link ?? selectedRoom.url ?? selectedRoom.meetingUrl ?? "";
        window.open(link, "_blank");

        // Close dialog and reset
        setPasswordDialogOpen(false);
        setSelectedRoom(null);
        setEnteredPassword("");
        ToastHelper.success("Joining room...");
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
                <h2 className="text-2xl font-bold tracking-tight">Room Management</h2>
            </div>
            {!courseId && (
                <div className="mb-4 p-3 rounded bg-yellow-50 text-sm text-yellow-800 border border-yellow-300">
                    Please open this page from the course management page or navigate with state/query.
                </div>
            )}

            {/* Filter and Create Button */}
            <div className="flex items-center justify-between gap-3 mb-4">
                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <label className="font-medium text-sm">Filter by Status:</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All ({filteredRooms.length})</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="ongoing">Ongoing</SelectItem>
                            <SelectItem value="ended">Ended</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Create Room Button */}
                <Button
                    onClick={() => setCreateDialogOpen(true)}
                    disabled={!isApproved}
                    className="bg-indigo-600 text-white hover:bg-indigo-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Room
                </Button>
            </div>

            {/* Rooms List */}
            <div className="space-y-3 max-h-[450px] overflow-y-auto mt-2 p-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
                {loading && <p>Loading room list...</p>}

                {!loading && rooms.length === 0 && (
                    <div className="text-gray-500 italic">
                        {isApproved ? "No rooms found." : "Course is not approved yet."}
                    </div>
                )}

                {!loading &&
                    filteredRooms.map((room) => {
                        const id = room._id ?? room.id;
                        const link = room.link ?? room.url ?? room.meetingUrl ?? "";

                        return (
                            <div
                                key={id}
                                className="flex justify-between items-center p-4 rounded-lg border bg-white shadow-sm hover:shadow-md transition-all"
                            >
                                {/* Room Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <div className="font-semibold text-lg">{room.name}</div>
                                        {room.password && room.password.trim() !== "" && (
                                            <Lock
                                                className="h-4 w-4 text-gray-500"
                                                title="Password protected"
                                            />
                                        )}
                                    </div>
                                    {room.description && (
                                        <p className="text-sm text-gray-600 mt-1">{room.description}</p>
                                    )}
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
                                        <p className="text-sm text-gray-500">No link</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1">
                                        <span
                                            className={`text-xs px-2 py-1 rounded-full ${room.status === "ongoing"
                                                ? "bg-green-100 text-green-700"
                                                : room.status === "ended"
                                                    ? "bg-gray-100 text-gray-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            {room.status}
                                        </span>
                                        {room.isPublic && (
                                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                                Public
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleJoinRoom(room)}
                                        disabled={!link}
                                    >
                                        {room.password && room.password.trim() !== "" ? (
                                            <>
                                                <Lock className="h-3 w-3 mr-1" />
                                                Join
                                            </>
                                        ) : (
                                            "Join"
                                        )}
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

            {/* Add Room Dialog */}
            <AddRoom
                open={createDialogOpen}
                setOpen={setCreateDialogOpen}
                courseId={courseId}
                onCreated={fetchRooms}
            />

            {/* Edit Room Dialog */}
            {editingRoom && (
                <EditRoom room={editingRoom} open={openEdit} setOpen={setOpenEdit} onUpdated={fetchRooms} />
            )}

            {/* Password Dialog */}
            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Password Required
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        <p className="text-sm text-gray-600">
                            This room is password protected. Please enter the password to join.
                        </p>
                        <div>
                            <label className="text-sm font-medium">Password</label>
                            <Input
                                type="password"
                                placeholder="Enter room password"
                                value={enteredPassword}
                                onChange={(e) => setEnteredPassword(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        handlePasswordSubmit();
                                    }
                                }}
                                className="mt-1"
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setPasswordDialogOpen(false);
                                setEnteredPassword("");
                                setSelectedRoom(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handlePasswordSubmit}>Join Room</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RoomMeeting;
