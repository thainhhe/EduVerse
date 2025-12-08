"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AddInstructorModal } from "./AddInstructorModal";
import { useAuth } from "@/hooks/useAuth";
import { permissionService } from "@/services/permission";
import { getCourseById } from "@/services/courseService";
import { ConfirmationHelper } from "@/helper/ConfirmationHelper";
import { ToastHelper } from "@/helper/ToastHelper";

export default function PermissionsPage() {
    const [instructors, setInstructors] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);

    const { user } = useAuth();

    const rawCourseData = typeof window !== "undefined" ? sessionStorage.getItem("currentCourseData") : null;
    const sessionCourseData = rawCourseData ? JSON.parse(rawCourseData) : null;

    const isOwner = sessionCourseData?.main_instructor?._id === user?._id;
    console.log("isOwner", isOwner);
    console.log("user", user);
    console.log("sessionCourseData", sessionCourseData);

    // 1️⃣ Fetch permission list
    const fetchPermissions = async () => {
        try {
            const res = await permissionService.getAll();
            if (res.success) setPermissions(res?.data || []);
        } catch (error) {
            console.log("Fetch permission error:", error);
        }
    };

    // 2️⃣ Fetch instructors of this course
    const getCourseWithPermission = async () => {
        try {
            const res = await getCourseById(sessionCourseData._id);
            if (res.success) {
                const ins = res.data?.instructors?.map((i) => ({
                    _id: i.user._id,
                    username: i.user.username,
                    email: i.user.email,
                    permissions: i.permission.map((p) => p._id),
                    isAccept: i.isAccept,
                }));
                setInstructors(ins);
            }
        } catch (error) {
            console.log("Load course permission error:", error);
        }
    };

    useEffect(() => {
        fetchPermissions();
        getCourseWithPermission();
    }, []);

    // 3️⃣ Toggle checkbox permission
    const togglePermission = (userId, permissionId) => {
        setInstructors((prev) =>
            prev.map((inst) => {
                if (inst._id !== userId) return inst;
                const exists = inst.permissions.includes(permissionId);
                return {
                    ...inst,
                    permissions: exists
                        ? inst.permissions.filter((id) => id !== permissionId)
                        : [...inst.permissions, permissionId],
                };
            })
        );
    };

    // 5️⃣ Save changes to server
    const saveChanges = async () => {
        setLoading(true);
        try {
            const payload = {
                instructors: instructors.map((i) => ({
                    email: i.email,
                    permissions: i.permissions,
                })),
            };

            const res = await permissionService.assign(payload);

            if (res.success) {
                ToastHelper.success("Save permission successfully.");
                getCourseWithPermission();
            } else {
                ToastHelper.error("Failed to update permissions!");
            }
        } catch (error) {
            console.log("Save error:", error);
        }
        setLoading(false);
    };

    // 6️⃣ Add new instructor
    const addInstructor = async (data) => {
        try {
            const res = await permissionService.assign({
                currentCourseId: sessionCourseData._id,
                instructors: [
                    {
                        email: data.email,
                        permissions: data.permissions,
                    },
                ],
            });

            if (res.data[0].success) {
                setInstructors((prev) => [
                    ...prev,
                    {
                        _id: Date.now().toString(),
                        email: data.email,
                        permissions: data.permissions,
                        isAccept: false,
                    },
                ]);
                getCourseWithPermission();
            } else {
                ToastHelper.error("Thông tin không hợp lệ.");
            }
        } catch (error) {
            console.log("Err Permission:", error);
            ToastHelper.error("Có lỗi xảy ra");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-full mx-auto">
                <div className="mb-5">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Instructor Permissions</h1>
                    <p className="text-gray-600">Adjust access levels for instructors in this course.</p>
                </div>

                <div className="bg-white p-4 border-1">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Instructor Access Table</h2>
                        <div className="flex gap-2">
                            <Button
                                onClick={saveChanges}
                                disabled={loading}
                                className="bg-green-600 text-white"
                            >
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>

                            <Button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-blue-600 text-white gap-2"
                            >
                                <Plus size={18} /> Add Instructor
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="text-left">
                                <tr className="border-b border-gray-200">
                                    <th>Name / Email</th>
                                    <th>----</th>
                                    {permissions.map((p) => (
                                        <th key={p._id}>{p.name}</th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {isOwner && (
                                    <tr className="border-b border-gray-200">
                                        {" "}
                                        <td className="py-4">
                                            {" "}
                                            <p className="font-medium text-gray-900">{user?.username}</p>{" "}
                                            <p className="text-sm text-gray-500">{user.email}</p>{" "}
                                        </td>{" "}
                                        <td className="text-blue-700">Owner</td>{" "}
                                        {permissions.map((p) => (
                                            <td key={p._id} className="text-center">
                                                {" "}
                                                <Checkbox
                                                    checked={true}
                                                    className="!rounded-none data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                                />{" "}
                                            </td>
                                        ))}{" "}
                                    </tr>
                                )}
                                {instructors.map((inst) => (
                                    <tr key={inst._id} className="border-b border-gray-100">
                                        <td className="py-3">
                                            <p className="text-sm text-gray-900">{inst?.username}</p>
                                            <p className="text-sm text-gray-500">{inst.email}</p>
                                        </td>
                                        <td>{inst.isAccept ? "Accepted" : "Pending"}</td>

                                        {permissions.map((p) => (
                                            <td key={p._id} className="text-center">
                                                <Checkbox
                                                    checked={inst.permissions.includes(p._id)}
                                                    className="!rounded-none data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                                    onCheckedChange={() => togglePermission(inst._id, p._id)}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <AddInstructorModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSubmit={addInstructor}
                permissionOptions={permissions}
            />
        </div>
    );
}
