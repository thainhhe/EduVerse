import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-toastify";
import { Settings, Shield, Bell, CreditCard, Save } from "lucide-react";

const SystemConfigurationModal = ({ isOpen, onClose }) => {
    const [config, setConfig] = useState({
        siteName: "EduVerse",
        supportEmail: "support@eduverse.com",
        maintenanceMode: false,
        sessionTimeout: "30",
        passwordExpiry: false,
        enableEmail: true,
        smtpHost: "smtp.gmail.com",
        currency: "USD",
        taxRate: "10",
    });

    const handleChange = (key, value) => {
        setConfig((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        // Mock API call
        console.log("Saving system configuration:", config);
        toast.success("System configuration saved successfully!");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Settings className="h-5 w-5 text-indigo-600" />
                        System Configuration
                    </DialogTitle>
                    <DialogDescription>Manage global system settings and preferences.</DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="general" className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="general" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" /> General
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
                    <TabsContent value="general" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="siteName">Site Name</Label>
                            <Input
                                id="siteName"
                                value={config.siteName}
                                onChange={(e) => handleChange("siteName", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="supportEmail">Support Email</Label>
                            <Input
                                id="supportEmail"
                                type="email"
                                value={config.supportEmail}
                                onChange={(e) => handleChange("supportEmail", e.target.value)}
                            />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                            <div className="space-y-0.5">
                                <Label className="text-base">Maintenance Mode</Label>
                                <p className="text-sm text-slate-500">
                                    Prevent users from accessing the site during maintenance.
                                </p>
                            </div>
                            <Switch
                                checked={config.maintenanceMode}
                                onCheckedChange={(checked) => handleChange("maintenanceMode", checked)}
                            />
                        </div>
                    </TabsContent>

                    {/* Security Settings */}
                    <TabsContent value="security" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                            <Input
                                id="sessionTimeout"
                                type="number"
                                value={config.sessionTimeout}
                                onChange={(e) => handleChange("sessionTimeout", e.target.value)}
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
                                checked={config.passwordExpiry}
                                onCheckedChange={(checked) => handleChange("passwordExpiry", checked)}
                            />
                        </div>
                    </TabsContent>

                    {/* Notification Settings */}
                    <TabsContent value="notifications" className="space-y-4 py-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                            <div className="space-y-0.5">
                                <Label className="text-base">Enable Email Notifications</Label>
                                <p className="text-sm text-slate-500">Send system emails to users.</p>
                            </div>
                            <Switch
                                checked={config.enableEmail}
                                onCheckedChange={(checked) => handleChange("enableEmail", checked)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="smtpHost">SMTP Host</Label>
                            <Input
                                id="smtpHost"
                                value={config.smtpHost}
                                onChange={(e) => handleChange("smtpHost", e.target.value)}
                                disabled={!config.enableEmail}
                            />
                        </div>
                    </TabsContent>

                    {/* Payment Settings */}
                    <TabsContent value="payment" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Currency</Label>
                            <Select
                                value={config.currency}
                                onValueChange={(val) => handleChange("currency", val)}
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
                        <div className="space-y-2">
                            <Label htmlFor="taxRate">Tax Rate (%)</Label>
                            <Input
                                id="taxRate"
                                type="number"
                                value={config.taxRate}
                                onChange={(e) => handleChange("taxRate", e.target.value)}
                            />
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default SystemConfigurationModal;
