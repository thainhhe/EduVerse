import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Lightbulb } from "lucide-react";

export function AddInstructorModal({ open, onOpenChange, onSubmit, permissionOptions }) {
    const [email, setEmail] = useState("");
    const [permissions, setPermissions] = useState({});
    const [error, setError] = useState("");

    const validateEmail = (value) => {
        if (!value.trim()) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Email invalid";
        return "";
    };

    useEffect(() => {
        setError("");
    }, []);

    const handleSubmit = () => {
        const validationError = validateEmail(email);
        if (validationError) {
            setError(validationError);
            return;
        }

        const selectedPermissions = Object.keys(permissions).filter((key) => permissions[key] === true);

        onSubmit({
            email: email.trim(),
            permissions: selectedPermissions,
        });

        // Reset form
        setEmail("");
        setPermissions({});
        setError("");
        onOpenChange(false);
    };

    const togglePermission = (permissionId) => {
        setPermissions((prev) => ({
            ...prev,
            [permissionId]: !prev[permissionId],
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                        Add New Instructor
                    </DialogTitle>
                    <div className="flex items-center gap-2">
                        <Lightbulb className="text-yellow-500 inline mr-1" />
                        <span className="text-sm text-gray-600 mt-1">
                            The email must be registered as instructor in the system.
                        </span>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <Input
                            type="email"
                            placeholder="instructor@example.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (error) setError(validateEmail(e.target.value)); // live validation
                            }}
                            className={error ? "border-red-500" : ""}
                        />
                        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                    </div>

                    {/* Permissions */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
                        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                            {permissionOptions.map((option) => (
                                <div key={option._id} className="flex items-center gap-2">
                                    <Checkbox
                                        className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                        id={option._id}
                                        checked={permissions[option._id] || false}
                                        onCheckedChange={() => togglePermission(option._id)}
                                    />
                                    <label
                                        htmlFor={option._id}
                                        className="text-sm text-gray-700 cursor-pointer"
                                    >
                                        {option.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} className="bg-blue-600 text-white">
                        Send Invitation
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
