import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, ChevronLeft, ChevronRight, Eye, Lock, Unlock, Download, Plus } from "lucide-react";
import { ToastHelper } from "@/helper/ToastHelper";
import { ConfirmationHelper } from "@/helper/ConfirmationHelper";
import { getAllUsers, lockUser, unlockUser } from "@/services/userService";
import Swal from "sweetalert2";
import { AddNewUser } from "./AddNewUser";
import * as XLSX from "xlsx";
import { useAuth } from "@/hooks/useAuth";

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUsers, setSelectedUsers] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const [openAddNewUser, setOpenAddNewUser] = useState(false);
    const [openEditUser, setOpenEditUser] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const { user } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await getAllUsers();
            if (res?.success) {
                setUsers(res.data || []);
            } else {
                ToastHelper.error("Failed to fetch users");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            ToastHelper.error("Error loading users");
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        const matchesStatus = statusFilter === "all" || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedUsers(currentUsers.map((user) => user._id));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleSelectOne = (id, checked) => {
        if (checked) {
            setSelectedUsers([...selectedUsers, id]);
        } else {
            setSelectedUsers(selectedUsers.filter((userId) => userId !== id));
        }
    };

    const handleLockUser = async (userId) => {
        try {
            const res = await lockUser(userId);
            console.log("res", res);
            if (res?.success) {
                Swal.fire({
                    icon: "success",
                    title: "Locked!",
                    text: "User locked successfully!",
                });
                setUsers(users.map((u) => (u._id === userId ? { ...u, status: "locked" } : u)));
                setSelectedUsers(selectedUsers.filter((id) => id !== userId));
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error!",
                    text: "Failed to lock user!",
                });
            }
        } catch (error) {
            console.error("Error locking user:", error);
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: "Error locking user!",
            });
        }
    };

    const handleUnlockUser = async (userId) => {
        try {
            const res = await unlockUser(userId);
            if (res?.success) {
                Swal.fire({
                    icon: "success",
                    title: "Unlocked!",
                    text: "User unlocked successfully!",
                });
                setUsers(users.map((u) => (u._id === userId ? { ...u, status: "active" } : u)));
                setSelectedUsers(selectedUsers.filter((id) => id !== userId));
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error!",
                    text: "Failed to unlock user!",
                });
            }
        } catch (error) {
            console.error("Error unlocking user:", error);
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: "Error unlocking user!",
            });
        }
    };

    const handleAddSuccess = async () => {
        Swal.fire({
            icon: "success",
            title: "Added!",
            text: "User added successfully!",
        });
        await fetchUsers();
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "active":
                return (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                        Active
                    </Badge>
                );
            case "banned":
                return (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">Banned</Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("vi-VN");
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }
    const handleExportExcel = () => {
        // 1. Xác định dữ liệu cần export
        const exportSource =
            selectedUsers.length > 0
                ? filteredUsers.filter((u) => selectedUsers.includes(u._id))
                : filteredUsers;

        if (exportSource.length === 0) {
            ToastHelper.error("No users to export");
            return;
        }

        // 2. Chuẩn hoá dữ liệu cho Excel
        const exportData = exportSource.map((user, index) => ({
            No: index + 1,
            Username: user.username || "",
            Email: user.email || "",
            Role: user.role || "",
            Status: user.status || "",
            "Created At": formatDateTime(user.createdAt),
            "Last Login": formatDateTime(user.lastLogin),
        }));

        // 3. Tạo worksheet & workbook
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

        // 4. Xuất file
        const fileName =
            selectedUsers.length > 0 ? `users_selected_${Date.now()}.xlsx` : `users_${Date.now()}.xlsx`;

        XLSX.writeFile(workbook, fileName);
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-full mx-auto shadow-sm border-none">
                <div className="pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-2  bg-gray-500 text-black">
                        <div className="flex flex-col items-center sm:flex-row gap-2">
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-full sm:w-[150px] max-w-[100px] bg-white text-black flex items-center hover:text-white hover:bg-indigo-600">
                                    <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="learner">Learner</SelectItem>
                                    <SelectItem value="instructor">Instructor</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[150px] max-w-[100px] bg-white text-black flex items-center hover:text-white hover:bg-indigo-600">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="locked">Locked</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                variant="outline"
                                className="bg-white text-black flex items-center hover:text-white hover:bg-indigo-600"
                                onClick={handleExportExcel}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>

                            {user?.isSuperAdmin && (
                                <Button
                                    className="bg-white text-black flex items-center hover:text-white hover:bg-indigo-600"
                                    onClick={() => setOpenAddNewUser(true)}
                                >
                                    <Plus className="h-4 w-4" />
                                    New User
                                </Button>
                            )}
                        </div>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search users..."
                                className="pl-8 w-full sm:w-[250px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <div className="bg-white">
                    <div className="overflow-y-auto">
                        <Table>
                            <TableHeader className="bg-gray-300">
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox
                                            checked={
                                                selectedUsers.length === currentUsers.length &&
                                                currentUsers.length > 0
                                            }
                                            onCheckedChange={handleSelectAll}
                                            aria-label="Select all"
                                            className="!rounded"
                                        />
                                    </TableHead>
                                    <TableHead>User(Total:{users.length})</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead>Last Login</TableHead>
                                    {selectedUsers.length > 0 && (
                                        <TableHead className="text-right">Actions</TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                            No users found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentUsers.map((user) => (
                                        <TableRow
                                            key={user._id}
                                            className={`hover:bg-gray-200 transition-colors cursor-pointer ${
                                                selectedUsers.includes(user._id) ? "bg-gray-200" : ""
                                            }`}
                                            onClick={() =>
                                                handleSelectOne(user._id, !selectedUsers.includes(user._id))
                                            }
                                        >
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedUsers.includes(user._id)}
                                                    onCheckedChange={(checked) =>
                                                        handleSelectOne(user._id, checked)
                                                    }
                                                    aria-label={`Select ${user.username}`}
                                                    className="!rounded data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={user.avatar} />
                                                        <AvatarFallback>
                                                            {user.username?.charAt(0)?.toUpperCase() || "U"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {user.username}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="capitalize">{user.role}</TableCell>
                                            <TableCell>{getStatusBadge(user.status)}</TableCell>
                                            <TableCell className="text-gray-500 text-sm">
                                                {formatDateTime(user.createdAt)}
                                            </TableCell>
                                            <TableCell className="text-gray-500 text-sm">
                                                {formatDateTime(user.lastLogin)}
                                            </TableCell>
                                            {selectedUsers.length > 0 && (
                                                <TableCell
                                                    className="text-right"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {selectedUsers.includes(user._id) && (
                                                        <div className="flex items-center justify-end gap-2">
                                                            {user.status === "active" && (
                                                                <ConfirmationHelper
                                                                    trigger={
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                        >
                                                                            <Lock className="h-4 w-4" />
                                                                        </Button>
                                                                    }
                                                                    title="Lock User"
                                                                    description="Are you sure you want to lock this user?"
                                                                    confirmText="Lock"
                                                                    onConfirm={() => handleLockUser(user._id)}
                                                                />
                                                            )}
                                                            {user.status === "banned" && (
                                                                <ConfirmationHelper
                                                                    trigger={
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                        >
                                                                            <Unlock className="h-4 w-4" />
                                                                        </Button>
                                                                    }
                                                                    title="Unlock User"
                                                                    description="Are you sure you want to unlock this user?"
                                                                    confirmText="Unlock"
                                                                    onConfirm={() =>
                                                                        handleUnlockUser(user._id)
                                                                    }
                                                                />
                                                            )}
                                                            <Button
                                                                asChild
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 text-gray-500 hover:text-gray-700"
                                                            >
                                                                <Link
                                                                    to={`/admin/users/${user.role}/${user._id}`}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2 pb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Rows per page:</span>
                            <select
                                value={itemsPerPage.toString()}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="w-[70px] border-none text-sm"
                            >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                                Page {currentPage} of {totalPages || 1}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="text-sm flex items-center gap-2"
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="text-sm flex items-center gap-2"
                            >
                                Next <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <AddNewUser
                open={openAddNewUser}
                onOpenChange={(open) => setOpenAddNewUser(open)}
                onAddSuccess={handleAddSuccess}
            />
        </div>
    );
};

export default UserManagementPage;
