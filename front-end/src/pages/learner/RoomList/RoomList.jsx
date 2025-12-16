import { useEffect, useState } from "react";
import roomService from "@/services/roomService";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, User, Link as BookOpen, Search, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ToastHelper } from "@/helper/ToastHelper";

const RoomList = () => {
    const { user } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Password dialog state
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [enteredPassword, setEnteredPassword] = useState("");

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await roomService.getAllRooms();
                if (res.success) {
                    const data = res?.data?.data ?? res?.data ?? [];
                    // Only show public rooms
                    setRooms(data.filter((room) => room.isPublic === true && room.status === "ongoing"));
                }
            } catch (err) {
                console.error("❌ Failed to fetch rooms:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, []);

    const filteredRooms = rooms.filter((room) => {
        const term = searchTerm.toLowerCase();
        return (
            room.name?.toLowerCase().includes(term) ||
            room.description?.toLowerCase().includes(term) ||
            room.courseId?.title?.toLowerCase().includes(term) ||
            room.createdBy?.username?.toLowerCase().includes(term)
        );
    });

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

    const getStatusBadge = (status) => {
        const badges = {
            pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" },
            ongoing: { bg: "bg-green-100", text: "text-green-700", label: "Live" },
            ended: { bg: "bg-gray-100", text: "text-gray-700", label: "Ended" },
        };
        const badge = badges[status] || badges.pending;
        return (
            <div
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
            >
                {status === "ongoing" && (
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                )}
                {badge.label}
            </div>
        );
    };

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
            {/* Immersive Header */}
            <div className="bg-[#1a1b2e] text-white py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex-shrink-0 shadow-xl z-10">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
                    <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                        Public <span className="text-indigo-400">Classrooms</span>
                    </h1>
                    <p className="text-gray-400 text-base mb-6 max-w-2xl mx-auto">
                        Join public sessions and connect with instructors in real-time.
                    </p>

                    {/* Search Bar Embedded in Header */}
                    <div className="max-w-xl mx-auto relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <Input
                                type="text"
                                placeholder="Find your class..."
                                className="w-full pl-11 py-5 bg-[#24253a] border-gray-700 text-white placeholder-gray-500 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Content List */}
            <div
                className="flex-1 overflow-y-auto scrollbar-hide bg-gray-50"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-32 bg-white rounded-xl shadow-sm animate-pulse border border-gray-100"
                                ></div>
                            ))}
                        </div>
                    ) : filteredRooms.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100 mt-4">
                            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Calendar className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Public Sessions Found</h3>
                            <p className="text-gray-500">
                                {searchTerm
                                    ? "No classes match your search."
                                    : "There are no public classrooms available right now."}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredRooms.map((room) => (
                                <div
                                    key={room._id}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden group"
                                >
                                    <div className="flex flex-col md:flex-row">
                                        {/* Left: Time Badge */}
                                        <div className="md:w-48 bg-indigo-50/50 p-6 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-gray-100 group-hover:bg-indigo-50 transition-colors">
                                            <span className="text-indigo-600 font-bold text-2xl">
                                                {room.startTime
                                                    ? new Date(room.startTime).toLocaleTimeString("vi-VN", {
                                                          hour: "2-digit",
                                                          minute: "2-digit",
                                                      })
                                                    : "--:--"}
                                            </span>
                                            <span className="text-gray-500 text-sm font-medium mt-1">
                                                {room.startTime
                                                    ? new Date(room.startTime).toLocaleDateString("vi-VN", {
                                                          day: "numeric",
                                                          month: "short",
                                                      })
                                                    : "TBA"}
                                            </span>
                                            {getStatusBadge(room.status)}
                                        </div>

                                        {/* Middle: Info */}
                                        <div className="flex-1 p-6 flex flex-col justify-center">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                    {room.name}
                                                </h3>
                                                {room.password && room.password.trim() !== "" && (
                                                    <Lock
                                                        className="h-4 w-4 text-gray-500"
                                                        title="Password protected"
                                                    />
                                                )}
                                            </div>

                                            {room.description && (
                                                <p className="text-sm text-gray-600 mb-3">
                                                    {room.description}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4 text-gray-400" />
                                                    <span className="font-medium">
                                                        {room.courseId?.title || "Unknown Course"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    <span>
                                                        {room.createdBy?.username || "Unknown Instructor"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Action */}
                                        <div className="p-6 flex items-center justify-center md:justify-end">
                                            {room.link ? (
                                                <Button
                                                    onClick={() => handleJoinRoom(room)}
                                                    className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 rounded-lg font-semibold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all"
                                                >
                                                    {room.password && room.password.trim() !== "" ? (
                                                        <>
                                                            <Lock className="h-4 w-4 mr-2" />
                                                            Join Now
                                                        </>
                                                    ) : (
                                                        "Join Now"
                                                    )}
                                                </Button>
                                            ) : (
                                                <Button
                                                    disabled
                                                    variant="secondary"
                                                    className="w-full md:w-auto px-8 py-6"
                                                >
                                                    No Link
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

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

export default RoomList;
