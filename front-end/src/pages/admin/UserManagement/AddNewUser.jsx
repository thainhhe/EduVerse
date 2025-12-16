import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import authService from "@/services/authService";
import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export const AddNewUser = ({ open, onOpenChange, onAddSuccess }) => {
    const [user, setUser] = useState({
        username: "",
        email: "",
        password: "",
        status: "active",
        role: "learner",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!user.username.trim()) {
            newErrors.username = "Username is required";
        } else if (user.username.trim().length < 3) {
            newErrors.username = "Username must be at least 3 characters";
        }

        if (!user.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email.trim())) {
            newErrors.email = "Invalid email format";
        }

        if (!user.password.trim()) {
            newErrors.password = "Password is required";
        } else if (user.password.trim().length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fix the errors in the form");
            return;
        }

        setIsLoading(true);
        try {
            const res = await authService.register(user);
            if (res?.success) {
                onAddSuccess();
                onOpenChange(false);
                setUser({
                    username: "",
                    email: "",
                    password: "",
                    status: "active",
                    role: "learner",
                });
                setErrors({});
            } else {
                toast.error(res?.message || "Failed to add user");
            }
        } catch (error) {
            console.error("Error adding user:", error);
            toast.error(error?.response?.data?.message || "Error adding user");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangeInput = (e) => {
        const { name, value } = e.target;
        setUser((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleSelectChange = (name, value) => {
        setUser((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-3 pb-4 border-b">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Add New User
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label
                                    htmlFor="username"
                                    className="text-sm font-medium text-gray-700 flex items-center gap-2"
                                >
                                    Username <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={user.username}
                                    onChange={handleChangeInput}
                                    placeholder="Enter username"
                                    className={`transition-all duration-200 ${
                                        errors.username
                                            ? "border-red-500 focus:ring-red-500"
                                            : "focus:ring-blue-500"
                                    }`}
                                />
                                {errors.username && (
                                    <p className="text-xs text-red-500 animate-in slide-in-from-top-1">
                                        {errors.username}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label
                                    htmlFor="email"
                                    className="text-sm font-medium text-gray-700 flex items-center gap-2"
                                >
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={user.email}
                                    onChange={handleChangeInput}
                                    placeholder="user@example.com"
                                    className={`transition-all duration-200 ${
                                        errors.email
                                            ? "border-red-500 focus:ring-red-500"
                                            : "focus:ring-blue-500"
                                    }`}
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500 animate-in slide-in-from-top-1">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium text-gray-700 flex items-center gap-2"
                                >
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={user.password}
                                        onChange={handleChangeInput}
                                        placeholder="Min. 6 characters"
                                        className={`transition-all duration-200 ${
                                            errors.password
                                                ? "border-red-500 focus:ring-red-500"
                                                : "focus:ring-blue-500"
                                        }`}
                                    />
                                    {errors.password && (
                                        <p className="text-xs text-red-500 animate-in slide-in-from-top-1">
                                            {errors.password}
                                        </p>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label
                                    htmlFor="role"
                                    className="text-sm font-medium text-gray-700 flex items-center gap-2"
                                >
                                    Role
                                </label>
                                <Select
                                    value={user.role}
                                    onValueChange={(value) => handleSelectChange("role", value)}
                                >
                                    <SelectTrigger className="focus:ring-blue-500">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Admin</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="instructor">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Instructor</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="learner">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Learner</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label
                            htmlFor="status"
                            className="text-sm font-medium text-gray-700 flex items-center gap-2"
                        >
                            Account Status
                        </label>
                        <div className="flex p-1.5 items-center justify-between border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-3 h-3 rounded-full transition-colors ${
                                        user.status
                                            ? "bg-green-500 shadow-lg shadow-green-500/50"
                                            : "bg-gray-400"
                                    }`}
                                ></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {user.status === "active" ? "Active" : "Inactive"}
                                    </p>
                                </div>
                            </div>
                            <Switch
                                id="status"
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:shadow-blue-600/50"
                                checked={user.status === "active"}
                                onCheckedChange={(checked) => handleSelectChange("status", checked)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                            className="flex-1 hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Adding User...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Add User
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
