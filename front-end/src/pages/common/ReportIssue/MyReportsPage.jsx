import { useEffect, useState } from "react";
import { reportService } from "@/services/reportService";
import { useAuth } from "@/hooks/useAuth";
import Pagination from "@/helper/Pagination";

const MyReportsPage = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    useEffect(() => {
        if (!user?._id) return;

        const fetchReports = async () => {
            setLoading(true);
            try {
                const res = await reportService.getMyReports(user._id);
                if (res.success) {
                    setReports(res.data || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [user]);

    // Phân trang
    const totalPages = Math.ceil(reports.length / pageSize);
    const paginatedReports = reports.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="max-w-full mx-auto mt-10 bg-white p-8 rounded-lg shadow">
            <h1 className="text-3xl font-bold mb-6">My Report History</h1>

            {loading ? (
                <p>Loading...</p>
            ) : reports.length === 0 ? (
                <p className="text-gray-500">You have not submitted any reports.</p>
            ) : (
                <>
                    <div className="space-y-4">
                        {paginatedReports.map((report) => (
                            <div key={report._id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                                <h3 className="font-semibold text-lg capitalize">
                                    Type/Scope: {report.issueType} / {report.scope}
                                </h3>
                                <p className="text-gray-700 mt-2">Description: {report.description}</p>
                                <p className="text-sm mt-2">
                                    Status:{" "}
                                    <span
                                        className={`font-medium ${
                                            report.status === "open"
                                                ? "text-blue-600"
                                                : report.status === "inprogress"
                                                ? "text-yellow-600"
                                                : "text-green-600"
                                        }`}
                                    >
                                        {report.status}
                                    </span>
                                </p>

                                <p className="text-xs text-gray-400">
                                    Date: {new Date(report.createdAt).toLocaleString("vi-VN")}
                                </p>
                            </div>
                        ))}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                        pageWindow={5}
                    />
                </>
            )}
        </div>
    );
};

export default MyReportsPage;
