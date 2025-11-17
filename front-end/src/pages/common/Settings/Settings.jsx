import { useState, useEffect, useRef } from "react";
import { Lock, Pencil, Trash2, Mail, Bell, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import authService from "@/services/authService";
import { toast } from "react-toastify";

const Settings = () => {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    avatar: "",
    id: null,
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
        // backend middleware expects field name "avatar"
        form.append("avatar", selectedAvatar);
        await authService.updateProfile(profile.id, form);
      } else {
        const payload = {
          username: profile.fullName,
          // don't allow email change here if backend disallows; keep email for completeness
          email: profile.email,
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
        }));
        setAvatarPreview(user.avatar || avatarPreview);
        setSelectedAvatar(null);
      }
      toast.success("Profile updated");
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Update failed";
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
    if (newPassword.length < 8)
      return toast.error("New password must be at least 8 characters");
    if (newPassword !== confirmPassword)
      return toast.error("Passwords do not match");

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
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Change password failed";
      toast.error(msg);
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            User Settings
          </h1>
          <p className="text-gray-600">
            Manage your CourseFlow account, preferences, and notification
            settings.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Manage your profile details and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar
                className="w-20 h-20 cursor-pointer"
                onClick={openFilePicker}
              >
                <AvatarImage
                  src={
                    avatarPreview ||
                    profile.avatar ||
                    "/diverse-user-avatars.png"
                  }
                  alt={profile.fullName}
                />
                <AvatarFallback>
                  {(profile.fullName || "?").charAt(0)}
                </AvatarFallback>
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

              <div className="flex-1">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profile.fullName}
                  onChange={(e) =>
                    handleProfileChange("fullName", e.target.value)
                  }
                  className="bg-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div>
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
                  <div>
                    <Label htmlFor="currentPassword">Current password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div>
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

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Control how you receive alerts and updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-pink-500" />
                <span className="font-medium">Email Notifications</span>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={() => handleNotificationToggle("email")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-pink-500" />
                <span className="font-medium">In-App Notifications</span>
              </div>
              <Switch
                checked={notifications.inApp}
                onCheckedChange={() => handleNotificationToggle("inApp")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lightbulb className="h-5 w-5 text-pink-500" />
                <span className="font-medium">Marketing & Promotions</span>
              </div>
              <Switch
                checked={notifications.marketing}
                onCheckedChange={() => handleNotificationToggle("marketing")}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">⚠️ Danger Zone</CardTitle>
            <CardDescription>
              Proceed with caution. These actions are irreversible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Delete Account</h3>
                <p className="text-sm text-gray-600">
                  Permanently delete your CourseFlow account and all associated
                  data.
                </p>
              </div>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
