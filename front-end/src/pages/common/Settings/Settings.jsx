import { useState, useEffect, useRef } from "react";
import { Lock, Pencil, Trash2, Mail, Bell, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import authService from "@/services/authService";
import { toast } from "react-toastify";

const Settings = () => {
    const [profile, setProfile] = useState({
        fullName: "",
        email: "",
        avatar: "",
        id: null,
        bio: "",
        introduction: "",
        address: "",
        phoneNumber: "",
        job_title: "",
        subject_instructor: "",
        role: "learner",
    });

    // thêm state để quản lý file avatar và preview
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null);

    const [notifications, setNotifications] = useState({
        email: false,
        inApp: false,
        marketing: false,
    });

    const [loading, setLoading] = useState(false);

    // password change UI state
    const [showChangeForm, setShowChangeForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changing, setChanging] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const me = await authService.getCurrentUser();
                // normalizing response similar to AuthContext
                const normalized = me?.data?.user ?? me?.data ?? me;
                const user = normalized?.user ?? normalized ?? null;

                if (user) {
                    setProfile({
                        fullName: user.username || user.name || "",
                        email: user.email || "",
                        avatar: user.avatar || "",
                        id: user._id || user.id || null,
                        bio: user.bio || "",
                        introduction: user.introduction || "",
                        address: user.address || "",
                        phoneNumber: user.phoneNumber || "",
                        job_title: user.job_title || "",
                        subject_instructor: user.subject_instructor || "",
                        role: user.role || "learner",
                    });
                    setNotifications({
                        email: !!user.emailNotifications,
                        inApp: !!user.systemNotifications,
                        marketing: !!user.marketingNotifications, // optional
                    });
                    // set preview từ avatar hiện có
                    setAvatarPreview(user.avatar || null);
                }
            } catch (err) {
                console.warn("Failed to load current user:", err);
            }
        };

        load();
    }, []);

    // xử lý khi chọn file
    const handleSelectAvatar = (file) => {
        if (!file) return;
        setSelectedAvatar(file);
        const url = URL.createObjectURL(file);
        setAvatarPreview(url);
    };

    // mở file dialog
    const openFilePicker = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    // giải phóng objectURL khi component unmount hoặc avatar thay đổi
    useEffect(() => {
        return () => {
            if (avatarPreview && selectedAvatar) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview, selectedAvatar]);

    const handleProfileChange = (key, value) => {
        setProfile((p) => ({ ...p, [key]: value }));
    };

    const handleSaveProfile = async () => {
        if (!profile.id) return toast.error("Missing user id");
        setLoading(true);
        try {
            // nếu có file avatar, gửi multipart/form-data
            if (selectedAvatar) {
                const form = new FormData();
                form.append("username", profile.fullName);
                form.append("bio", profile.bio);
                form.append("introduction", profile.introduction);
                form.append("address", profile.address);
                form.append("phoneNumber", profile.phoneNumber);
                form.append("job_title", profile.job_title);
                form.append("subject_instructor", profile.subject_instructor);
                // backend middleware expects field name "avatar"
                form.append("avatar", selectedAvatar);
                await authService.updateProfile(profile.id, form);
            } else {
                const payload = {
                    username: profile.fullName,
                    // don't allow email change here if backend disallows; keep email for completeness
                    email: profile.email,
                    bio: profile.bio,
                    introduction: profile.introduction,
                    address: profile.address,
                    phoneNumber: profile.phoneNumber,
                    job_title: profile.job_title,
                    subject_instructor: profile.subject_instructor,
                };
                await authService.updateProfile(profile.id, payload);
            }

            // refresh user data
            const me = await authService.getCurrentUser();
            const normalized = me?.data?.user ?? me?.data ?? me;
            const user = normalized?.user ?? normalized ?? null;
            if (user) {
                setProfile((p) => ({
                    ...p,
                    fullName: user.username || user.name || p.fullName,
                    avatar: user.avatar || p.avatar,
                    bio: user.bio || p.bio,
                    introduction: user.introduction || p.introduction,
                    address: user.address || p.address,
                    phoneNumber: user.phoneNumber || p.phoneNumber,
                    job_title: user.job_title || p.job_title,
                    subject_instructor: user.subject_instructor || p.subject_instructor,
                }));
                setAvatarPreview(user.avatar || avatarPreview);
                setSelectedAvatar(null);
            }
            toast.success("Profile updated");
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Update failed";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationToggle = async (key) => {
        const next = { ...notifications, [key]: !notifications[key] };
        setNotifications(next);

        if (!profile.id) return;
        setLoading(true);
        try {
            const payload = {
                emailNotifications: next.email,
                systemNotifications: next.inApp,
                marketingNotifications: next.marketing,
            };
            await authService.updateProfile(profile.id, payload);
            toast.success("Notification settings saved");
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Save failed";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        toast.info("Delete account not implemented in UI");
    };

    const handleStartChange = () => {
        setShowChangeForm(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    const handleCancelChange = () => {
        setShowChangeForm(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    const handleChangePassword = async () => {
        if (!profile.id) return toast.error("Missing user id");
        if (!currentPassword || !newPassword || !confirmPassword)
            return toast.error("Please fill all fields");
        if (newPassword.length < 8) return toast.error("New password must be at least 8 characters");
        if (newPassword !== confirmPassword) return toast.error("Passwords do not match");

        setChanging(true);
        try {
            // backend expects POST /auth/change-password/:id
            await authService.changePassword(profile.id, {
                currentPassword,
                newPassword,
            });
            toast.success("Password changed");
            handleCancelChange();
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Change password failed";
            toast.error(msg);
        } finally {
            setChanging(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">User Settings</h1>
                    <p className="text-gray-600">
                        Manage your CourseFlow account, preferences, and notification settings.
                    </p>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>Manage your profile details and preferences.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="w-20 h-20 cursor-pointer" onClick={openFilePicker}>
                                <AvatarImage
                                    src={avatarPreview || profile.avatar || "/diverse-user-avatars.png"}
                                    alt={profile.fullName}
                                />
                                <AvatarFallback>{(profile.fullName || "?").charAt(0)}</AvatarFallback>
                            </Avatar>

                            {/* hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleSelectAvatar(f);
                                }}
                            />

                            <div className="flex-1 space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    value={profile.fullName}
                                    onChange={(e) => handleProfileChange("fullName", e.target.value)}
                                    className="bg-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                <Input
                                    id="phoneNumber"
                                    value={profile.phoneNumber}
                                    onChange={(e) => handleProfileChange("phoneNumber", e.target.value)}
                                    className="bg-white"
                                    placeholder="+84..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    value={profile.address}
                                    onChange={(e) => handleProfileChange("address", e.target.value)}
                                    className="bg-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                value={profile.bio}
                                onChange={(e) => handleProfileChange("bio", e.target.value)}
                                className="bg-white"
                                placeholder="Short bio about yourself..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="introduction">Introduction</Label>
                            <Textarea
                                id="introduction"
                                value={profile.introduction}
                                onChange={(e) => handleProfileChange("introduction", e.target.value)}
                                className="bg-white min-h-[100px]"
                                placeholder="Detailed introduction..."
                            />
                        </div>

                        {profile.role === "instructor" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="job_title">Job Title</Label>
                                    <Select
                                        value={profile.job_title}
                                        onValueChange={(val) => handleProfileChange("job_title", val)}
                                    >
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Select job title" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="manager">Manager</SelectItem>
                                            <SelectItem value="professor">Professor</SelectItem>
                                            <SelectItem value="instructor">Instructor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subject_instructor">Subject</Label>
                                    <Input
                                        id="subject_instructor"
                                        value={profile.subject_instructor}
                                        onChange={(e) =>
                                            handleProfileChange("subject_instructor", e.target.value)
                                        }
                                        className="bg-white"
                                        placeholder="e.g. Mathematics, Computer Science"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={profile.email}
                                disabled
                                className="bg-gray-100"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            {!showChangeForm ? (
                                <div className="flex gap-2">
                                    <Input
                                        id="password"
                                        type="password"
                                        value="********"
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={handleStartChange}
                                        disabled={!profile.id}
                                    >
                                        <Lock className="mr-2 h-4 w-4" />
                                        Change
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">Current password</Label>
                                        <Input
                                            id="currentPassword"
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New password</Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={handleChangePassword} disabled={changing}>
                                            Save
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={handleCancelChange}
                                            disabled={changing}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button
                                className="bg-indigo-600 hover:bg-indigo-700"
                                onClick={handleSaveProfile}
                                disabled={loading}
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Save Changes
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => window.location.reload()}
                                disabled={loading}
                            >
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Settings;
