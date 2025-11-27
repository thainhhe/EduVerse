import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import notificationService from "@/services/notificationService";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { Bell, Send, Trash2, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";

const NotificationManagementPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        message: "",
        type: "info",
        recipientType: "global", // 'global' or 'specific'
        receiverId: "",
        link: "",
    });

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            // Fetch global notifications for now, or all if an admin endpoint exists
            // Since there isn't a specific "get all for admin" endpoint in the service shown earlier,
            // we might only be able to show global ones or need a new endpoint.
            // For this demo, let's fetch global ones.
            const res = await notificationService.getGlobal();
            if (res.success || res.status === 200) {
                setNotifications(res.data || []);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.message) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (formData.recipientType === "specific" && !formData.receiverId) {
            toast.error("Please provide a Receiver ID");
            return;
        }

        try {
            const payload = {
                title: formData.title,
                message: formData.message,
                type: formData.type,
                link: formData.link,
                isGlobal: formData.recipientType === "global",
                receiverId: formData.recipientType === "specific" ? formData.receiverId : null,
            };

            const res = await notificationService.create(payload);
            if (res.success || res.status === 200) {
                toast.success("Notification sent successfully");
                setFormData({
                    title: "",
                    message: "",
                    type: "info",
                    recipientType: "global",
                    receiverId: "",
                    link: "",
                });
                fetchNotifications();
            } else {
                toast.error("Failed to send notification");
            }
        } catch (error) {
            console.error("Error sending notification:", error);
            toast.error("An error occurred");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this notification?")) return;
        try {
            const res = await notificationService.delete(id);
            if (res.success || res.status === 200) {
                toast.success("Notification deleted");
                fetchNotifications();
            }
        } catch (error) {
            console.error("Error deleting notification:", error);
            toast.error("Failed to delete notification");
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case "success":
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case "warning":
                return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            case "error":
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Notification Management</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Create Notification Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Send className="w-5 h-5" /> Send Notification
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Notification Title"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    placeholder="Notification content..."
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(val) => handleSelectChange("type", val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="info">Info</SelectItem>
                                            <SelectItem value="success">Success</SelectItem>
                                            <SelectItem value="warning">Warning</SelectItem>
                                            <SelectItem value="error">Error</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Recipient</Label>
                                    <Select
                                        value={formData.recipientType}
                                        onValueChange={(val) => handleSelectChange("recipientType", val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select recipient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="global">Global (All Users)</SelectItem>
                                            <SelectItem value="specific">Specific User</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {formData.recipientType === "specific" && (
                                <div className="space-y-2">
                                    <Label htmlFor="receiverId">User ID</Label>
                                    <Input
                                        id="receiverId"
                                        name="receiverId"
                                        value={formData.receiverId}
                                        onChange={handleInputChange}
                                        placeholder="Enter User ID"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="link">Link (Optional)</Label>
                                <Input
                                    id="link"
                                    name="link"
                                    value={formData.link}
                                    onChange={handleInputChange}
                                    placeholder="/courses/..."
                                />
                            </div>

                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                                Send Notification
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Recent Global Notifications List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5" /> Recent Global Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {notifications.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="text-center py-4 text-muted-foreground"
                                            >
                                                No global notifications found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        notifications.map((notif) => (
                                            <TableRow key={notif._id}>
                                                <TableCell>{getTypeIcon(notif.type)}</TableCell>
                                                <TableCell className="font-medium">
                                                    <div>{notif.title}</div>
                                                    <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                                                        {notif.message}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {notif.createdAt
                                                        ? format(new Date(notif.createdAt), "MMM d, yyyy")
                                                        : "-"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => handleDelete(notif._id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default NotificationManagementPage;
