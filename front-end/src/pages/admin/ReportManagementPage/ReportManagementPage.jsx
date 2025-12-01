import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ToastHelper } from "@/helper/ToastHelper";
import { reportService } from "@/services/reportService";

const ReportManagementPage = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await reportService.getAllReportsByAdmin();
            console.log("res", res);
            if (res.success) {
                setReports(res?.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch reports", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const res = await reportService.updateReportStatus(id, newStatus);
            if (res.success) {
                ToastHelper.success("Cập nhật trạng thái thành công");
                fetchReports();
            } else {
                ToastHelper.error("Cập nhật trạng thái thất bại");
            }
        } catch (err) {
            console.error(err);
            ToastHelper.error("Cập nhật trạng thái thất bại");
        }
    };

    return (
        <div className="">
            <Card>
                <CardHeader>
                    <CardTitle>All Reports ({reports.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading ...</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Scope</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Assignee</TableHead>
                                    <TableHead>Issue Type</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead>Update Status Reports</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reports.map((item) => (
                                    <TableRow key={item._id}>
                                        <TableCell>{item.userId?.username}</TableCell>
                                        <TableCell>{item.userId?.email}</TableCell>
                                        <TableCell>{item.scope}</TableCell>
                                        <TableCell>{item.courseId?.title || "N/A"}</TableCell>
                                        <TableCell>{item.userId?.username || "Admin"}</TableCell>
                                        <TableCell>{item.issueType}</TableCell>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell className="flex items-center gap-2">
                                            <span
                                                className={`px-2 py-1 rounded text-white text-sm ${
                                                    item.status === "open"
                                                        ? "bg-blue-500"
                                                        : item.status === "inprogress"
                                                        ? "bg-yellow-500"
                                                        : "bg-green-500"
                                                }`}
                                            >
                                                {item.status}
                                            </span>
                                        </TableCell>

                                        <TableCell>
                                            {new Date(item.createdAt).toLocaleString("vi-VN")}
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={item.status}
                                                onValueChange={(value) => handleUpdateStatus(item._id, value)}
                                            >
                                                <SelectTrigger className="w-[120px]">
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem
                                                        value="open"
                                                        className="text-blue-600 font-semibold hover:bg-blue-100"
                                                    >
                                                        Open
                                                    </SelectItem>
                                                    <SelectItem
                                                        value="inprogress"
                                                        className="text-yellow-600 font-semibold hover:bg-yellow-100"
                                                    >
                                                        In Progress
                                                    </SelectItem>
                                                    <SelectItem
                                                        value="resolved"
                                                        className="text-green-600 font-semibold hover:bg-green-100"
                                                    >
                                                        Resolved
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ReportManagementPage;
