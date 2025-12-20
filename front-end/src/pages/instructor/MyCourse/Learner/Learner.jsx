import React from "react";
import { Progress } from "@/components/ui/progress";
import { CircleSmall } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Learner = ({ learner, index }) => {
    const user = learner.userId;
    return (
        <div className="flex flex-col md:flex-row items-center border-2 border-white border-l-indigo-600 bg-white shadow-sm p-4 mb-3 hover:shadow-md transition-shadow">
            {/* User info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-500 text-lg font-semibold">
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                        user.username[0].toUpperCase()
                    )}
                </div>
                <div className="truncate">
                    <div className="font-medium text-gray-900 truncate">{user.username}</div>
                    <div className="text-sm text-gray-500 truncate">{user.email}</div>
                </div>
            </div>

            {/* Enrollment & Progress */}
            <div className="flex-1 mt-3 md:mt-0 md:ml-6 flex flex-col gap-1 w-full md:w-auto">
                <div className="flex gap-1 items-center mb-1">
                    <span className="text-sm text-indigo-600 font-medium">Enrollment Date -</span>
                    <span className="text-sm text-gray-700">
                        {new Date(learner.enrollmentDate).toLocaleDateString()}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <Progress value={learner.progress} className="h-3 rounded-full bg-gray-200 flex-1" />
                    <span className="text-sm font-medium text-gray-600 min-w-[2.5rem] text-right">
                        {Math.round(learner.progress)}%
                    </span>
                </div>
            </div>

            {/* Status
            <div className="flex-1 mt-3 md:mt-0 md:ml-6 flex flex-col items-start md:items-end w-full md:w-auto">
                <Badge
                    variant="outline"
                    className={`capitalize px-3 py-1 text-sm rounded-full 
            ${
                learner.grade !== "Incomplete"
                    ? "border-green-500 text-green-600"
                    : "border-yellow-500 text-yellow-600"
            }`}
                >
                    {learner.grade}
                </Badge>
            </div> */}
        </div>
    );
};

export default Learner;
