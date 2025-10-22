import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SideBar from "../SideBar/SideBar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, Clock } from "lucide-react";

const CourseBuilderLayout = () => {
    const navigate = useNavigate();


    return (
        <div>
            <header className="">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            className="gap-2 bg-gray-100"
                            onClick={() => navigate("/create-course")}
                        >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                            Back
                        </Button>

                        <div>
                            <div className="text-sm text-muted-foreground">My Courses</div>
                        </div>
                    </div>
                    <div className='flex'>
                        <Clock className="text-green-500" />
                        <span className="text-sm text-muted-foreground">Last Updated: 08/01/11 | <strong>September 28, 2024</strong></span>

                    </div>
                </div>
            </header>
            <div className="flex min-h-screen">
                <SideBar />
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default CourseBuilderLayout;
