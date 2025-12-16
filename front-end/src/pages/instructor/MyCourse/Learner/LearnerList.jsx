import React, { useEffect, useState, useMemo } from "react";
import { getUerInCourse } from "@/services/courseService";
import Learner from "./Learner";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const LearnerList = () => {
    const [learners, setLearners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [progressFilter, setProgressFilter] = useState("all");

    const storageCourseId = typeof window !== "undefined" ? sessionStorage.getItem("currentCourseId") : null;

    // Fetch learners
    useEffect(() => {
        if (!storageCourseId) return;

        const fetchLearners = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getUerInCourse(storageCourseId);
                if (res.success) setLearners(res?.data || []);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch learners.");
            } finally {
                setLoading(false);
            }
        };

        fetchLearners();
    }, [storageCourseId]);

    // Filtered result
    const filteredLearners = useMemo(() => {
        return learners
            .filter((l) => {
                const name = l.userId?.username?.toLowerCase() || "";
                const email = l.userId?.email?.toLowerCase() || "";
                const searchTerm = search.toLowerCase();

                return name.includes(searchTerm) || email.includes(searchTerm);
            })
            .filter((l) => (statusFilter === "all" ? true : l.status === statusFilter))
            .filter((l) => {
                if (progressFilter === "all") return true;
                if (progressFilter === "completed") return l.progress >= 100;
                if (progressFilter === "incomplete") return l.progress < 100;
                return true;
            });
    }, [learners, search, statusFilter, progressFilter]);

    const total = learners.length;
    const completedCount = learners.filter((l) => l.progress >= 1).length;
    const completionRate = total ? Math.round((completedCount / total) * 100) : 0;

    if (loading)
        return (
            <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="animate-spin h-5 w-5" />
                Loading learners...
            </div>
        );

    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="flex-1">
            <div className="flex flex-col md:flex-row gap-4 mb-2 text-sm">
                <span className="font-semibold">Total Learners: {total}</span>
                <span className="font-semibold text-indigo-600">
                    Rate completed: {completedCount}/{total} ({completionRate}%)
                </span>
            </div>
            <div className="space-y-4 border-t-2  border-gray-200 border-t-indigo-600">
                {/* Filters Section */}
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-white p-4 shadow-sm">
                    {/* Search */}
                    <Input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="md:w-1/3"
                    />

                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-40">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Progress Filter */}
                    <Select value={progressFilter} onValueChange={setProgressFilter}>
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Progress" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Progress</SelectItem>
                            <SelectItem value="completed">Completed (100%)</SelectItem>
                            <SelectItem value="incomplete">Incomplete (&lt;100%)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Result */}
                {filteredLearners.length === 0 ? (
                    <div className="text-gray-500">No learners found.</div>
                ) : (
                    <div className="flex-1 max-h-[400px] overflow-y-auto mt-2p-1space-y-2scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
                        {filteredLearners.map((learner, index) => (
                            <Learner key={learner._id} learner={learner} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LearnerList;
