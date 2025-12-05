import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import authService from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToastHelper } from "@/helper/ToastHelper";
import { Loader2, Camera, User, Mail, Phone, MapPin, Lock, Shield } from "lucide-react";

const AdminProfilePage = () => {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Profile Form State
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phoneNumber: "",
        address: "",
        bio: "",
    });

    // Password Form State
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || "",
                email: user.email || "",
                phoneNumber: user.phoneNumber || "",
                address: user.address || "",
                bio: user.bio || "",
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("avatar", file);

        setUploading(true);
        try {
            const res = await authService.updateProfile(user._id, formData);
            if (res.success) {
                ToastHelper.success("Avatar updated successfully");
                // Update local user context if needed, or re-fetch
                // Assuming setUser updates the context
                const updatedUser = { ...user, avatar: res.data.avatar };
                // If setUser is available from useAuth, use it. Otherwise we might need to reload or re-fetch.
                // Checking useAuth implementation, it returns context.
                // Usually context has a way to update user. If not, we might need to reload.
                // Let's assume setUser exists or we can just update the UI locally for now.
                if (setUser) setUser(updatedUser);
            } else {
                ToastHelper.error(res.message || "Failed to update avatar");
            }
        } catch (error) {
            console.error(error);
            ToastHelper.error("Error updating avatar");
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authService.updateProfile(user._id, formData);
            if (res.success) {
                ToastHelper.success("Profile updated successfully");
                if (setUser) setUser({ ...user, ...formData });
            } else {
                ToastHelper.error(res.message || "Failed to update profile");
            }
        } catch (error) {
            console.error(error);
            ToastHelper.error("Error updating profile");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            ToastHelper.error("New passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const res = await authService.changePassword(user._id, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });

            if (res.success) {
                ToastHelper.success("Password changed successfully");
                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            } else {
                ToastHelper.error(res.message || "Failed to change password");
            }
        } catch (error) {
            console.error(error);
            ToastHelper.error(error.response?.data?.message || "Error changing password");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Profile</h1>
                <p className="text-slate-500">Manage your account settings and preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sidebar / User Card */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-none shadow-md overflow-hidden">
                        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                        <CardContent className="relative pt-0 pb-6 flex flex-col items-center">
                            <div className="relative -mt-16 mb-4 group">
                                <Avatar
                                    className="h-32 w-32 border-4 border-white shadow-lg cursor-pointer transition-transform group-hover:scale-105"
                                    onClick={handleAvatarClick}
                                >
                                    <AvatarImage src={user.avatar} className="object-cover" />
                                    <AvatarFallback className="text-4xl bg-slate-200 text-slate-500">
                                        {user.username?.charAt(0)?.toUpperCase()}
                                    </AvatarFallback>
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="h-8 w-8 text-white" />
                                    </div>
                                </Avatar>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                {uploading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-full">
                                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                                    </div>
                                )}
                            </div>

                            <h2 className="text-2xl font-bold text-slate-900">{user.username}</h2>
                            <p className="text-slate-500 font-medium">{user.role}</p>

                            <div className="w-full mt-6 space-y-4">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Mail className="h-5 w-5 text-indigo-500" />
                                    <span className="text-sm">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Phone className="h-5 w-5 text-indigo-500" />
                                    <span className="text-sm">{user.phoneNumber || "No phone number"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <MapPin className="h-5 w-5 text-indigo-500" />
                                    <span className="text-sm">{user.address || "No address provided"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Shield className="h-5 w-5 text-indigo-500" />
                                    <span className="text-sm capitalize">
                                        Status:{" "}
                                        <span className="text-green-600 font-medium">{user.status}</span>
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content / Tabs */}
                <div className="lg:col-span-8">
                    <Tabs defaultValue="profile" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="profile">Profile Details</TabsTrigger>
                            <TabsTrigger value="security">Security</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile">
                            <Card className="border-none shadow-md">
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                    <CardDescription>Update your personal details here.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="username">Full Name</Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        id="username"
                                                        name="username"
                                                        value={formData.username}
                                                        onChange={handleInputChange}
                                                        className="pl-10"
                                                        placeholder="Enter your name"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email Address</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        id="email"
                                                        name="email"
                                                        value={formData.email}
                                                        disabled
                                                        className="pl-10 bg-slate-50"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        id="phoneNumber"
                                                        name="phoneNumber"
                                                        value={formData.phoneNumber}
                                                        onChange={handleInputChange}
                                                        className="pl-10"
                                                        placeholder="Enter phone number"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="address">Address</Label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        id="address"
                                                        name="address"
                                                        value={formData.address}
                                                        onChange={handleInputChange}
                                                        className="pl-10"
                                                        placeholder="Enter your address"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="bio">Bio</Label>
                                            <textarea
                                                id="bio"
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleInputChange}
                                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="Tell us a little about yourself"
                                            />
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={loading}
                                                className="bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Save Changes
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="security">
                            <Card className="border-none shadow-md">
                                <CardHeader>
                                    <CardTitle>Change Password</CardTitle>
                                    <CardDescription>
                                        Ensure your account is secure by using a strong password.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleChangePassword} className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="currentPassword">Current Password</Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        id="currentPassword"
                                                        name="currentPassword"
                                                        type="password"
                                                        value={passwordData.currentPassword}
                                                        onChange={handlePasswordChange}
                                                        className="pl-10"
                                                        placeholder="Enter current password"
                                                    />
                                                </div>
                                            </div>
                                            <Separator />
                                            <div className="space-y-2">
                                                <Label htmlFor="newPassword">New Password</Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        id="newPassword"
                                                        name="newPassword"
                                                        type="password"
                                                        value={passwordData.newPassword}
                                                        onChange={handlePasswordChange}
                                                        className="pl-10"
                                                        placeholder="Enter new password"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        id="confirmPassword"
                                                        name="confirmPassword"
                                                        type="password"
                                                        value={passwordData.confirmPassword}
                                                        onChange={handlePasswordChange}
                                                        className="pl-10"
                                                        placeholder="Confirm new password"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={loading}
                                                className="bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Update Password
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default AdminProfilePage;
