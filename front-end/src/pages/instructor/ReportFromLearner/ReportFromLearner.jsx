import React, { useEffect, useState } from "react";

import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ToastHelper } from "@/helper/ToastHelper";
import { reportService } from "@/services/reportService";
import { useAuth } from "@/hooks/useAuth";
import {
    Search,
    Filter,
    AlertCircle,
    CheckCircle2,
    Clock,
    MoreHorizontal,
    User,
    Mail,
    BookOpen,
    FileText,
    Calendar,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

const ReportFromLearner = () => {
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const { user } = useAuth();

    useEffect(() => {
        fetchReports();
    }, []);

    useEffect(() => {
        filterReports();
        setCurrentPage(1); // Reset to first page on filter change
    }, [searchTerm, statusFilter, reports]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const res = await reportService.getAllReportsByIntructors(user?._id);
            if (res.success) {
                setReports(res?.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch reports", err);
            ToastHelper.error("Failed to load reports");
        } finally {
            setLoading(false);
        }
    };

    const filterReports = () => {
        let result = [...reports];

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(
                (item) =>
                    item.userId?.username?.toLowerCase().includes(lowerTerm) ||
                    item.userId?.email?.toLowerCase().includes(lowerTerm) ||
                    item.courseId?.title?.toLowerCase().includes(lowerTerm) ||
                    item.description?.toLowerCase().includes(lowerTerm)
            );
        }

        if (statusFilter !== "all") {
            result = result.filter((item) => item.status === statusFilter);
        }

        setFilteredReports(result);
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredReports.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const getStatusBadge = (status) => {
        switch (status) {
            case "open":
                return (
                    <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 whitespace-nowrap"
                    >
                        <AlertCircle className="w-3 h-3 mr-1" /> Open
                    </Badge>
                );
            case "inprogress":
                return (
                    <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 whitespace-nowrap"
                    >
                        <Clock className="w-3 h-3 mr-1" /> In Progress
                    </Badge>
                );
            case "resolved":
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 whitespace-nowrap"
                    >
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Resolved
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6 bg-gray-50/50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Learner Reports</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and resolve issues reported by your students.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-medium">
                        Total: {reports.length}
                    </div>
                    <div className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-md text-sm font-medium">
                        Open: {reports.filter((r) => r.status === "open").length}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by user, course, or description..."
                                className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="inprogress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <div className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-12 space-y-4">
                            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                            <p className="text-muted-foreground animate-pulse">Loading reports...</p>
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <div className="bg-gray-100 p-4 rounded-full mb-4">
                                <FileText className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">No reports found</h3>
                            <p className="text-muted-foreground max-w-sm mt-1">
                                {searchTerm || statusFilter !== "all"
                                    ? "Try adjusting your search or filters to find what you're looking for."
                                    : "Great job! There are no reports to display at this time."}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow>
                                        <TableHead className="w-[20%] whitespace-nowrap">User Info</TableHead>
                                        <TableHead className="w-[20%] whitespace-nowrap">
                                            Course Context
                                        </TableHead>
                                        <TableHead className="w-[10%] whitespace-nowrap">
                                            Issue Type
                                        </TableHead>
                                        <TableHead className="w-[25%]">Description</TableHead>
                                        <TableHead className="w-[10%] whitespace-nowrap">Status</TableHead>
                                        <TableHead className="w-[10%] whitespace-nowrap">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentItems.map((item) => (
                                        <TableRow
                                            key={item._id}
                                            className="hover:bg-gray-50/50 transition-colors"
                                        >
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 font-medium text-gray-900">
                                                        <User className="h-3.5 w-3.5 text-blue-500" />
                                                        {item.userId?.username || "Unknown User"}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Mail className="h-3 w-3" />
                                                        {item.userId?.email || "No email"}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 font-medium text-gray-900">
                                                        <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                                                        <span
                                                            className="truncate max-w-[180px]"
                                                            title={item.courseId?.title}
                                                        >
                                                            {item.courseId?.title || "N/A"}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground px-2 py-0.5 bg-gray-100 rounded-full w-fit">
                                                        Scope: {item.scope}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium text-gray-700">
                                                    {item.issueType}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <p
                                                    className="text-sm text-gray-600 line-clamp-2"
                                                    title={item.description}
                                                >
                                                    {item.description}
                                                </p>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(item.createdAt).toLocaleTimeString("vi-VN", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {filteredReports.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200">
                        <div className="text-sm text-gray-500">
                            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                            <span className="font-medium">
                                {Math.min(indexOfLastItem, filteredReports.length)}
                            </span>{" "}
                            of <span className="font-medium">{filteredReports.length}</span> results
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-md border ${
                                    currentPage === 1
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                                }`}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter((page) => {
                                    return (
                                        page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
                                    );
                                })
                                .map((page, index, array) => {
                                    // Add ellipsis if there are gaps
                                    const prevPage = array[index - 1];
                                    const showEllipsis = prevPage && page - prevPage > 1;

                                    return (
                                        <React.Fragment key={page}>
                                            {showEllipsis && <span className="px-2 text-gray-500">...</span>}
                                            <button
                                                onClick={() => paginate(page)}
                                                className={`px-3 py-1 rounded-md text-sm font-medium border ${
                                                    currentPage === page
                                                        ? "bg-blue-600 text-white border-blue-600"
                                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        </React.Fragment>
                                    );
                                })}

                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded-md border ${
                                    currentPage === totalPages
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                                }`}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportFromLearner;
