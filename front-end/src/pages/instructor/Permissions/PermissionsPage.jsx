"use client"

import { useState } from "react"
import { Trash2, Plus, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { AddInstructorModal } from "./AddInstructorModal"



const initialInstructors = [
    {
        id: "1",
        name: "Instructor1",
        email: "instructor1@fpt.edu.vn",
        role: "Owner",
        permissions: {
            createCourses: true,
            manageGrades: true,
            viewStudentDetails: true,
            sendAnnouncements: true,
            editProfile: true,
            platformAdmin: true,
        },
    },
    {
        id: "2",
        name: "Instructor2",
        email: "instructor2@fpt.edu.vn",
        role: "Pending",
        permissions: {
            createCourses: true,
            manageGrades: false,
            viewStudentDetails: true,
            sendAnnouncements: false,
            editProfile: true,
            platformAdmin: false,
        },
    },
    {
        id: "3",
        name: "Instructor3",
        email: "instructor3@fpt.edu.vn",
        role: "Instructor",
        permissions: {
            createCourses: true,
            manageGrades: true,
            viewStudentDetails: true,
            sendAnnouncements: true,
            editProfile: true,
            platformAdmin: false,
        },
    },
]

export default function PermissionsPage() {
    const [instructors, setInstructors] = useState(initialInstructors)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const togglePermission = (instructorId, permission) => {
        setInstructors(
            instructors.map((instructor) =>
                instructor.id === instructorId
                    ? {
                        ...instructor,
                        permissions: {
                            ...instructor.permissions,
                            [permission]: !instructor.permissions[permission],
                        },
                    }
                    : instructor,
            ),
        )
    }

    const deleteInstructor = (instructorId) => {
        setInstructors(instructors.filter((i) => i.id !== instructorId))
    }

    const getRoleColor = (role) => {
        switch (role) {
            case "Owner":
                return "bg-blue-50 text-blue-700"
            case "Pending":
                return "bg-yellow-50 text-yellow-700"
            case "Instructor":
                return "bg-gray-50 text-gray-700"
            default:
                return "bg-gray-50 text-gray-700"
        }
    }

    const addInstructor = (email, permissions) => {
        const newInstructor = {
            id: Date.now().toString(),
            name: email.split("@")[0],
            email,
            role: "Pending",
            permissions: {
                createCourses: permissions.manageCourse || false,
                manageGrades: permissions.cautions || false,
                viewStudentDetails: permissions.visible || false,
                sendAnnouncements: permissions.qa || false,
                editProfile: permissions.reviews || false,
                platformAdmin: permissions.performance || false,
            },
        }
        console.log("✅ Added Instructor:", newInstructor)
        setInstructors([...instructors, newInstructor])
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">E</span>
                        </div>
                        <span className="text-xl font-semibold text-gray-900">Eduvers</span>
                    </div>
                    <nav className="flex items-center gap-8">
                        <button className="text-gray-700 hover:text-gray-900 font-medium">Dashboard</button>
                        <button className="text-gray-700 hover:text-gray-900 font-medium">Users</button>
                        <button className="text-gray-700 hover:text-gray-900 font-medium">Settings</button>
                        <button className="text-gray-700 hover:text-gray-900 font-medium">Reports</button>
                    </nav>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-gray-600 hover:text-gray-900">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full"></div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Instructor Permissions</h1>
                    <p className="text-gray-600">
                        Review and adjust access levels for all instructors, ensuring proper authorization across the platform.
                    </p>
                </div>

                {/* Table Card */}
                <Card className="bg-white border border-gray-200">
                    <div className="p-6">
                        {/* Table Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">Instructor Access Table</h2>
                            <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                                <Plus size={18} />
                                Add Instructor
                            </Button>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Name / Email</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Role</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Create Courses</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Manage Grades</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">View Student Details</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Send Announcements</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Edit Profile</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Platform Admin</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {instructors.map((instructor) => (
                                        <tr key={instructor.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{instructor.name}</p>
                                                    <p className="text-sm text-gray-500">{instructor.email}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span
                                                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                                                        instructor.role,
                                                    )}`}
                                                >
                                                    {instructor.role}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <Checkbox
                                                    checked={instructor.permissions.createCourses}
                                                    onCheckedChange={() => togglePermission(instructor.id, "createCourses")}
                                                    className="mx-auto data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                                />
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <Checkbox
                                                    checked={instructor.permissions.manageGrades}
                                                    onCheckedChange={() => togglePermission(instructor.id, "manageGrades")}
                                                    className="mx-auto data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                                />
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <Checkbox
                                                    checked={instructor.permissions.viewStudentDetails}
                                                    onCheckedChange={() => togglePermission(instructor.id, "viewStudentDetails")}
                                                    className="mx-auto data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                                />
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <Checkbox
                                                    checked={instructor.permissions.sendAnnouncements}
                                                    onCheckedChange={() => togglePermission(instructor.id, "sendAnnouncements")}
                                                    className="mx-auto data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                                />
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <Checkbox
                                                    checked={instructor.permissions.editProfile}
                                                    onCheckedChange={() => togglePermission(instructor.id, "editProfile")}
                                                    className="mx-auto data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                                />
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <Checkbox
                                                    checked={instructor.permissions.platformAdmin}
                                                    onCheckedChange={() => togglePermission(instructor.id, "platformAdmin")}
                                                    className="mx-auto data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                                />
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <button
                                                    onClick={() => deleteInstructor(instructor.id)}
                                                    className="text-red-500 hover:text-red-700 transition-colors inline-flex items-center justify-center"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Card>
            </main>

            <AddInstructorModal open={isModalOpen} onOpenChange={setIsModalOpen} onSubmit={addInstructor} />


        </div>
    )
}
