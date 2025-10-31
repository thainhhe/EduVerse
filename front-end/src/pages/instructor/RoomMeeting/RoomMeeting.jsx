"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, Edit2, MoreVertical, Users, Clock, Plus } from "lucide-react"

// interface Meeting {
//   id: string
//   title: string
//   participants: number
//   scheduledTime: string
//   status: "Upcoming" | "Live" | "Ended"
// }

const MEETINGS = [
    {
        id: "1",
        title: "Q3 Product Strategy Review",
        participants: 15,
        scheduledTime: "8/10/2024, 10:00:00 AM",
        status: "Upcoming",
    },
    {
        id: "2",
        title: "Marketing Campaign Brainstorm",
        participants: 8,
        scheduledTime: "7/28/2024, 2:30:00 PM",
        status: "Live",
    },
    {
        id: "3",
        title: "Weekly Team Sync-up",
        participants: 12,
        scheduledTime: "7/22/2024, 9:00:00 AM",
        status: "Ended",
    },
    {
        id: "4",
        title: "Client Onboarding Call",
        participants: 3,
        scheduledTime: "8/1/2024, 11:00:00 AM",
        status: "Upcoming",
    },
    {
        id: "5",
        title: "Developer Stand-up",
        participants: 7,
        scheduledTime: "7/29/2024, 9:30:00 AM",
        status: "Live",
    },
    {
        id: "6",
        title: "Annual Shareholder Meeting",
        participants: 120,
        scheduledTime: "7/15/2024, 10:00:00 AM",
        status: "Ended",
    },
    {
        id: "7",
        title: "Project Alpha Kick-off",
        participants: 20,
        scheduledTime: "8/15/2024, 1:00:00 PM",
        status: "Upcoming",
    },
]

export default function RoomMeeting() {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [selectedMeeting, setSelectedMeeting] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)

    const itemsPerPage = 5
    const filteredMeetings = MEETINGS.filter((meeting) => {
        const matchesSearch = meeting.title.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "all" || meeting.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const totalPages = Math.ceil(filteredMeetings.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedMeetings = filteredMeetings.slice(startIndex, startIndex + itemsPerPage)

    const getStatusColor = (status) => {
        switch (status) {
            case "Upcoming":
                return "bg-blue-100 text-blue-800"
            case "Live":
                return "bg-red-100 text-red-800"
            case "Ended":
                return "bg-gray-100 text-gray-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Online Meetings</h1>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Meeting
                    </Button>
                </div>

                {/* Search and Filter */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                        <Input
                            placeholder="Search meetings..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="bg-white border-gray-200"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40 bg-white border-gray-200">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="Upcoming">Upcoming</SelectItem>
                            <SelectItem value="Live">Live</SelectItem>
                            <SelectItem value="Ended">Ended</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Meeting Title</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Participants</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Scheduled Time</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedMeetings.map((meeting) => (
                                    <tr
                                        key={meeting.id}
                                        onClick={() => setSelectedMeeting(meeting.id)}
                                        className={`border-b border-gray-200 cursor-pointer transition-colors ${selectedMeeting === meeting.id ? "bg-blue-50 border-l-4 border-l-blue-600" : "hover:bg-gray-50"
                                            }`}
                                    >
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{meeting.title}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Users className="w-4 h-4" />
                                                {meeting.participants}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Clock className="w-4 h-4" />
                                                {meeting.scheduledTime}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={getStatusColor(meeting.status)}>{meeting.status}</Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                                                    <Calendar className="w-4 h-4 text-gray-600" />
                                                </button>
                                                <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                                                    <Edit2 className="w-4 h-4 text-gray-600" />
                                                </button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                                                            <MoreVertical className="w-4 h-4 text-gray-600" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                                        <DropdownMenuItem>Edit Meeting</DropdownMenuItem>
                                                        <DropdownMenuItem>Delete Meeting</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-600">
                        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredMeetings.length)} of{" "}
                        {filteredMeetings.length} meetings
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
