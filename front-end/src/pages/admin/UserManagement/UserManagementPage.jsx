"use client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, File, Eye, X } from "lucide-react";
import { deleteUser, getAllUser } from "@/services/userService";
import { ToastHelper } from "@/helper/ToastHelper";
import Pagination from "@/helper/Pagination";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUser();
      console.log("res", res)
      setUsers(res?.data || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
      ToastHelper.error("Không thể tải danh sách user");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (user) => {
    if (user.role === "Student") navigate(`/admin/users/learner/${user._id}`);
    else if (user.role === "Instructor") navigate(`/admin/users/instructor/${user._id}`);
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id);
      ToastHelper.success("Xóa user thành công");
      setShowDeleteUserModal(false);
      setSelectedUserId(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      ToastHelper.error("Xóa user thất bại");
    }
  };

  const totalPages = Math.ceil(users.length / pageSize);
  const paginatedUsers = users.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Button className="bg-primary">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New User
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden md:table-cell">Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Creation Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow
                    key={user._id}
                    onClick={() => handleViewDetails(user)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar || ""} />
                          <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground hidden sm:block">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">{user.role}</TableCell>

                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-white text-xs ${user.status.toLowerCase() === "active"
                          ? "bg-green-500"
                          : user.status.toLowerCase() === "banned"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                          }`}
                      >
                        {user.status}
                      </span>
                    </TableCell>

                    <TableCell className="hidden lg:table-cell">
                      {new Date(user.createdAt).toLocaleString("vi-VN")}
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        {user.status.toLowerCase() === "active" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="px-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUserId(user._id);
                              setShowDeleteUserModal(true);
                            }}
                          >
                            ✗ Ban User
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-3 flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Eye className="w-4 h-4" /> View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {showDeleteUserModal && selectedUserId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[420px] relative border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Xác nhận xóa user</h2>
            <p>Bạn có chắc chắn muốn xóa / banned user này không?</p>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowDeleteUserModal(false)}>Hủy</Button>
              <Button variant="destructive" onClick={() => handleDeleteUser(selectedUserId)}>Xác nhận</Button>
            </div>

            <button
              onClick={() => setShowDeleteUserModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
        pageWindow={5}
      />
    </div>
  );
};

export default UserManagementPage;
