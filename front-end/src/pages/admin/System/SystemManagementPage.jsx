import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-toastify";
import { Settings, Shield, Bell, CreditCard, Save, Palette, Upload, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSystem } from "@/context/SystemContext";
import adminService from "@/services/adminService";
import Swal from "sweetalert2";

const SystemManagementPage = () => {
    const { updateSystemConfig } = useSystem();
    const [config, setConfig] = useState({
        // ... (initial state remains the same)
        general: {
            siteName: "EduVerse",
            supportEmail: "support@eduverse.com",
            facebook: "",
            twitter: "",
            linkedin: "",
            youtube: "",
            maintenanceMode: false,
        },
        appearance: {
            homeHeroImage: null,
            headerBgColor: "#ffffff",
            headerTextColor: "#000000",
            footerBgColor: "#1e293b",
            footerTextColor: "#ffffff",
        },
        security: {
            sessionTimeout: "30",
            passwordExpiry: false,
        },
        notifications: {
            enableEmail: true,
            smtpHost: "smtp.gmail.com",
        },
        payment: {
            currency: "USD",
            taxRate: "10",
        },
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const settings = await adminService.getSystemSettings();
            if (settings) {
                setConfig((prev) => ({
                    ...prev,
                    ...settings,
                    general: { ...prev.general, ...(settings.general || {}) },
                    appearance: { ...prev.appearance, ...(settings.appearance || {}) },
                    security: { ...prev.security, ...(settings.security || {}) },
                    notifications: { ...prev.notifications, ...(settings.notifications || {}) },
                    payment: { ...prev.payment, ...(settings.payment || {}) },
                }));
            }
        } catch (error) {
            console.error("Failed to fetch system settings:", error);
            toast.error("Failed to load system settings");
        }
    };

    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (e, key) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Create a local URL for preview
            const url = URL.createObjectURL(file);
            setConfig((prev) => ({
                ...prev,
                appearance: {
                    ...prev.appearance,
                    [key]: url,
                },
            }));
        }
    };

    // ... (handleChange remains the same)
    const handleChange = (section, key, value) => {
        setConfig((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value,
            },
        }));
    };

    const handleSave = async () => {
        try {
            const formData = new FormData();

            // Append the file if selected
            if (selectedFile) {
                formData.append("logo", selectedFile);
            }

            // Append other config data as JSON strings
            formData.append("general", JSON.stringify(config.general));
            formData.append("appearance", JSON.stringify(config.appearance));
            formData.append("security", JSON.stringify(config.security));
            formData.append("notifications", JSON.stringify(config.notifications));
            formData.append("payment", JSON.stringify(config.payment));

            const updatedSettings = await adminService.updateSystemSettings(formData);
            updateSystemConfig(updatedSettings);
            Swal.fire({
                icon: "success",
                title: "Success...",
                text: "System configuration saved successfully!",
            });
        } catch (error) {
            console.error("Failed to save system settings:", error);
            Swal.fire({
                icon: "error",
                title: "Error...",
                text: "Failed to save system settings",
            });
        }
    };

    const THEMES = {
        standard: {
            name: "Standard",
            headerBgColor: "#ffffff",
            headerTextColor: "#000000",
            footerBgColor: "#1e293b",
            footerTextColor: "#ffffff",
        },
        christmas: {
            name: "Christmas",
            headerBgColor: "#dc2626", // Red
            headerTextColor: "#ffffff",
            footerBgColor: "#166534", // Green
            footerTextColor: "#ffffff",
        },
        tet: {
            name: "Tet Holiday",
            headerBgColor: "#b91c1c", // Dark Red
            headerTextColor: "#fcd34d", // Gold
            footerBgColor: "#991b1b", // Darker Red
            footerTextColor: "#fcd34d",
        },
        dark: {
            name: "Dark Mode",
            headerBgColor: "#0f172a",
            headerTextColor: "#ffffff",
            footerBgColor: "#020617",
            footerTextColor: "#94a3b8",
        },
        blue: {
            name: "Professional Blue",
            headerBgColor: "#eff6ff",
            headerTextColor: "#1e40af",
            footerBgColor: "#1e3a8a",
            footerTextColor: "#ffffff",
        },
    };

    const handleThemeChange = (themeKey) => {
        const theme = THEMES[themeKey];
        if (theme) {
            setConfig((prev) => ({
                ...prev,
                appearance: {
                    ...prev.appearance,
                    headerBgColor: theme.headerBgColor,
                    headerTextColor: theme.headerTextColor,
                    footerBgColor: theme.footerBgColor,
                    footerTextColor: theme.footerTextColor,
                },
            }));
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">System Management</h1>
                    <p className="text-slate-500 mt-1">Manage global system settings and preferences.</p>
                </div>
                <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-5 max-w-3xl">
                    <TabsTrigger value="general" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" /> General
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="flex items-center gap-2">
                        <Palette className="h-4 w-4" /> Appearance
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" /> Security
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" /> Notify
                    </TabsTrigger>
                    <TabsTrigger value="payment" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" /> Payment
                    </TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Settings</CardTitle>
                            <CardDescription>Basic information about the platform.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="siteName">Site Name</Label>
                                <Input
                                    id="siteName"
                                    value={config.general.siteName}
                                    onChange={(e) => handleChange("general", "siteName", e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="supportEmail">Support Email</Label>
                                <Input
                                    id="supportEmail"
                                    type="email"
                                    value={config.general.supportEmail}
                                    onChange={(e) => handleChange("general", "supportEmail", e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="facebook">Facebook URL</Label>
                                    <Input
                                        id="facebook"
                                        value={config.general.facebook || ""}
                                        onChange={(e) => handleChange("general", "facebook", e.target.value)}
                                        placeholder="https://facebook.com/..."
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="twitter">Twitter URL</Label>
                                    <Input
                                        id="twitter"
                                        value={config.general.twitter || ""}
                                        onChange={(e) => handleChange("general", "twitter", e.target.value)}
                                        placeholder="https://twitter.com/..."
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="linkedin">LinkedIn URL</Label>
                                    <Input
                                        id="linkedin"
                                        value={config.general.linkedin || ""}
                                        onChange={(e) => handleChange("general", "linkedin", e.target.value)}
                                        placeholder="https://linkedin.com/..."
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="youtube">YouTube URL</Label>
                                    <Input
                                        id="youtube"
                                        value={config.general.youtube || ""}
                                        onChange={(e) => handleChange("general", "youtube", e.target.value)}
                                        placeholder="https://youtube.com/..."
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Maintenance Mode</Label>
                                    <p className="text-sm text-slate-500">
                                        Prevent users from accessing the site during maintenance.
                                    </p>
                                </div>
                                <Switch
                                    checked={config.general.maintenanceMode}
                                    onCheckedChange={(checked) =>
                                        handleChange("general", "maintenanceMode", checked)
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Appearance Settings */}
                <TabsContent value="appearance" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance Settings</CardTitle>
                            <CardDescription>
                                Customize the look and feel of the home page and layout.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Home Page Images */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Home Page Images</h3>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="homeHeroImage">Hero Section Image</Label>
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-40 h-24 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                                                {config.appearance.homeHeroImage ? (
                                                    <img
                                                        src={config.appearance.homeHeroImage}
                                                        alt="Hero Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-slate-400 text-xs">No image</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <Input
                                                    id="homeHeroImage"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(e, "homeHeroImage")}
                                                    className="cursor-pointer"
                                                />
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Recommended size: 1920x1080px. Max size: 5MB.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 my-4"></div>
                            <div className="space-y-4">
                                <Label>Theme Presets</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                    {Object.entries(THEMES).map(([key, theme]) => {
                                        const isSelected =
                                            config.appearance.headerBgColor === theme.headerBgColor &&
                                            config.appearance.footerBgColor === theme.footerBgColor;

                                        return (
                                            <div
                                                key={key}
                                                onClick={() => handleThemeChange(key)}
                                                className={`cursor-pointer group relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                                                    isSelected
                                                        ? "border-indigo-600 bg-indigo-50"
                                                        : "border-slate-100 hover:border-indigo-500 hover:bg-indigo-50"
                                                }`}
                                            >
                                                {isSelected && (
                                                    <div className="absolute top-2 right-2 text-indigo-600">
                                                        <Check className="w-4 h-4" />
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <div
                                                        className="w-6 h-6 rounded-full shadow-sm border border-slate-200"
                                                        style={{ backgroundColor: theme.headerBgColor }}
                                                        title="Header Color"
                                                    />
                                                    <div
                                                        className="w-6 h-6 rounded-full shadow-sm border border-slate-200"
                                                        style={{ backgroundColor: theme.footerBgColor }}
                                                        title="Footer Color"
                                                    />
                                                </div>
                                                <span
                                                    className={`text-xs font-medium text-center ${
                                                        isSelected
                                                            ? "text-indigo-700"
                                                            : "text-slate-700 group-hover:text-indigo-700"
                                                    }`}
                                                >
                                                    {theme.name}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-slate-500">
                                    Click on a theme to apply its colors. You can still fine-tune them below.
                                </p>
                            </div>
                            <div className="border-t border-slate-100 my-4"></div>
                            {/* Theme Colors */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Theme Colors</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Header Colors */}
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold text-slate-700">Header</h4>
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="headerBgColor">Background Color</Label>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 rounded-full border border-slate-200 shadow-sm"
                                                    style={{
                                                        backgroundColor: config.appearance.headerBgColor,
                                                    }}
                                                ></div>
                                                <Input
                                                    id="headerBgColor"
                                                    type="color"
                                                    value={config.appearance.headerBgColor}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "appearance",
                                                            "headerBgColor",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-20 h-8 p-1 cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="headerTextColor">Text Color</Label>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 rounded-full border border-slate-200 shadow-sm"
                                                    style={{
                                                        backgroundColor: config.appearance.headerTextColor,
                                                    }}
                                                ></div>
                                                <Input
                                                    id="headerTextColor"
                                                    type="color"
                                                    value={config.appearance.headerTextColor}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "appearance",
                                                            "headerTextColor",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-20 h-8 p-1 cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Colors */}
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold text-slate-700">Footer</h4>
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="footerBgColor">Background Color</Label>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 rounded-full border border-slate-200 shadow-sm"
                                                    style={{
                                                        backgroundColor: config.appearance.footerBgColor,
                                                    }}
                                                ></div>
                                                <Input
                                                    id="footerBgColor"
                                                    type="color"
                                                    value={config.appearance.footerBgColor}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "appearance",
                                                            "footerBgColor",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-20 h-8 p-1 cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="footerTextColor">Text Color</Label>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 rounded-full border border-slate-200 shadow-sm"
                                                    style={{
                                                        backgroundColor: config.appearance.footerTextColor,
                                                    }}
                                                ></div>
                                                <Input
                                                    id="footerTextColor"
                                                    type="color"
                                                    value={config.appearance.footerTextColor}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "appearance",
                                                            "footerTextColor",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-20 h-8 p-1 cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Settings</CardTitle>
                            <CardDescription>Manage security policies and timeouts.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                                <Input
                                    id="sessionTimeout"
                                    type="number"
                                    value={config.security.sessionTimeout}
                                    onChange={(e) =>
                                        handleChange("security", "sessionTimeout", e.target.value)
                                    }
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Force Password Expiry</Label>
                                    <p className="text-sm text-slate-500">
                                        Require users to change password every 90 days.
                                    </p>
                                </div>
                                <Switch
                                    checked={config.security.passwordExpiry}
                                    onCheckedChange={(checked) =>
                                        handleChange("security", "passwordExpiry", checked)
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notification Settings */}
                <TabsContent value="notifications" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Settings</CardTitle>
                            <CardDescription>Configure email and system notifications.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Enable Email Notifications</Label>
                                    <p className="text-sm text-slate-500">Send system emails to users.</p>
                                </div>
                                <Switch
                                    checked={config.notifications.enableEmail}
                                    onCheckedChange={(checked) =>
                                        handleChange("notifications", "enableEmail", checked)
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="smtpHost">SMTP Host</Label>
                                <Input
                                    id="smtpHost"
                                    value={config.notifications.smtpHost}
                                    onChange={(e) =>
                                        handleChange("notifications", "smtpHost", e.target.value)
                                    }
                                    disabled={!config.notifications.enableEmail}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Payment Settings */}
                <TabsContent value="payment" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Settings</CardTitle>
                            <CardDescription>Configure currency and tax rates.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Currency</Label>
                                <Select
                                    value={config.payment.currency}
                                    onValueChange={(val) => handleChange("payment", "currency", val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select currency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                        <SelectItem value="EUR">EUR (€)</SelectItem>
                                        <SelectItem value="VND">VND (₫)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                                <Input
                                    id="taxRate"
                                    type="number"
                                    value={config.payment.taxRate}
                                    onChange={(e) => handleChange("payment", "taxRate", e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SystemManagementPage;
