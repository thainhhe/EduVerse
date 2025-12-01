import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminService from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, ChevronLeft, ChevronRight, Eye, Download } from "lucide-react";

const InstructorRevenuePage = () => {
    const navigate = useNavigate();
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedInstructors, setSelectedInstructors] = useState([]);

    useEffect(() => {
        fetchData();
    }, [page, limit, search, selectedYear]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const startDate = new Date(selectedYear, 0, 1);
            const endDate = new Date(selectedYear, 11, 31, 23, 59, 59);

            const response = await adminService.getInstructorRevenueList({
                page,
                limit,
                search,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            });

            setInstructors(response || []);
            setTotalPages(Math.ceil((response.metadata?.total || 0) / limit));
        } catch (error) {
            console.error("Failed to fetch instructor revenue list:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedInstructors(instructors.map((i) => i.instructorId));
        } else {
            setSelectedInstructors([]);
        }
    };

    const handleSelectOne = (id, checked) => {
        if (checked) {
            setSelectedInstructors([...selectedInstructors, id]);
        } else {
            setSelectedInstructors(selectedInstructors.filter((i) => i !== id));
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-full mx-auto shadow-sm border-none">
                <div className="pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-2 bg-gray-500 text-black">
                        <div className="flex flex-col items-center sm:flex-row gap-2">
                            <div className="text-md flex items-center p-1.5 bg-white rounded-sm">
                                Instructors List {selectedInstructors.length} selected
                            </div>
                            <Select
                                value={selectedYear.toString()}
                                onValueChange={(val) => setSelectedYear(parseInt(val))}
                            >
                                <SelectTrigger className="w-full sm:w-[150px] max-w-[100px] bg-white">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(
                                        (year) => (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        )
                                    )}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" className="bg-white text-black hover:bg-gray-100">
                                <Download className="mr-2 h-4 w-4" /> Export
                            </Button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search instructor..."
                                className="pl-8 w-full sm:w-[250px]"
                                value={search}
                                onChange={handleSearch}
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
                                                selectedInstructors.length === instructors.length &&
                                                instructors.length > 0
                                            }
                                            onCheckedChange={handleSelectAll}
                                            className="!rounded"
                                        />
                                    </TableHead>
                                    <TableHead className="w-[80px]">Rank</TableHead>
                                    <TableHead>Instructor</TableHead>
                                    <TableHead className="text-right">Total Sales</TableHead>
                                    <TableHead className="text-right">Total Revenue</TableHead>
                                    {selectedInstructors.length > 0 && (
                                        <TableHead className="text-right">Actions</TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : instructors.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                            No instructors found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    instructors.map((instructor, index) => (
                                        <TableRow
                                            key={instructor.instructorId}
                                            className={`hover:bg-gray-200 transition-colors cursor-pointer ${
                                                selectedInstructors.includes(instructor.instructorId)
                                                    ? "bg-gray-200"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                handleSelectOne(
                                                    instructor.instructorId,
                                                    !selectedInstructors.includes(instructor.instructorId)
                                                )
                                            }
                                        >
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedInstructors.includes(
                                                        instructor.instructorId
                                                    )}
                                                    onCheckedChange={(checked) =>
                                                        handleSelectOne(instructor.instructorId, checked)
                                                    }
                                                    className="!rounded data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {(page - 1) * limit + index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage
                                                            src={instructor.avatar}
                                                            alt={instructor.name}
                                                        />
                                                        <AvatarFallback>
                                                            {instructor.name?.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {instructor.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {instructor.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {instructor.totalSales}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-green-600">
                                                {new Intl.NumberFormat("vi-VN", {
                                                    style: "currency",
                                                    currency: "VND",
                                                }).format(instructor.totalRevenue)}
                                            </TableCell>
                                            {selectedInstructors.length > 0 && (
                                                <TableCell
                                                    className="text-right"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {selectedInstructors.includes(
                                                        instructor.instructorId
                                                    ) && (
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 text-gray-500 hover:text-gray-700"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/admin/revenue/instructors/${instructor.instructorId}`
                                                                )
                                                            }
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
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
                                value={limit.toString()}
                                onChange={(e) => {
                                    setLimit(Number(e.target.value));
                                    setPage(1);
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
                                Page {page} of {totalPages || 1}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1 || loading}
                                className="text-sm flex items-center gap-2"
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || loading}
                                className="text-sm flex items-center gap-2"
                            >
                                Next <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructorRevenuePage;
