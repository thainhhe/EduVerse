import { useState } from "react";
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

const Settings = () => {
  const [profile, setProfile] = useState({
    fullName: "ABC",
    email: "abc@courseflow.com",
    avatar: "/diverse-user-avatars.png",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    inApp: true,
    marketing: false,
  });

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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
              <Avatar className="w-20 h-20">
                <AvatarImage
                  src={profile.avatar || "/placeholder.svg"}
                  alt={profile.fullName}
                />
                <AvatarFallback>{profile.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profile.fullName}
                  readOnly
                  className="bg-gray-50"
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
              <div className="flex gap-2">
                <Input
                  id="password"
                  type="password"
                  value="********"
                  readOnly
                  className="bg-gray-50"
                />
                <Button variant="outline">
                  <Lock className="mr-2 h-4 w-4" />
                  Change
                </Button>
              </div>
            </div>

            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
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
              <Button variant="destructive">
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
