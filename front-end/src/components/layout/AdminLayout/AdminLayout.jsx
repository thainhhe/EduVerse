import { useState } from "react";
import { cn } from "@/lib/utils";
import { Outlet, useLocation, Link } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Menu, ChevronRight } from "lucide-react";

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();

    // Generate breadcrumbs
    const pathnames = location.pathname.split("/").filter((x) => x);

    return (
        <div className="min-h-screen w-full flex bg-muted/40">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-50 h-full bg-background border-r transition-all duration-300 ease-in-out",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full",
                    "lg:translate-x-0",
                    isCollapsed ? "w-[80px]" : "w-[280px]"
                )}
            >
                <Sidebar isCollapsed={isCollapsed} />
            </div>

            <div
                className={cn(
                    "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
                    isCollapsed ? "lg:ml-[80px]" : "lg:ml-[280px]"
                )}
            >
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:h-16 sm:px-6">
                    <Menu className="h-5 w-5 lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)} />
                    {/* Desktop Sidebar Toggle */}
                    <Menu className="h-5 w-5" onClick={() => setIsCollapsed(!isCollapsed)} />
                    {/* Breadcrumbs */}
                    <nav className="hidden md:flex items-center text-sm text-muted-foreground ml-2">
                        {pathnames.map((value, index) => {
                            if (value === "admin") {
                                return (
                                    <div key={value} className="flex items-center">
                                        <span className="capitalize">Admin</span>
                                    </div>
                                );
                            }
                            const to = `/${pathnames.slice(0, index + 1).join("/")}`;
                            const isLast = index === pathnames.length - 1;
                            return (
                                <div key={to} className="flex items-center">
                                    {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
                                    <Link
                                        to={to}
                                        className={cn(
                                            "capitalize hover:text-foreground transition-colors",
                                            isLast && "text-foreground font-medium pointer-events-none"
                                        )}
                                    >
                                        {value.replace(/-/g, " ")}
                                    </Link>
                                </div>
                            );
                        })}
                    </nav>

                    <div className="relative ml-auto flex-1 md:grow-0"></div>
                    <Button variant="outline" size="icon" className="relative">
                        <Bell className="h-4 w-4" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
                                <img src="/professional-man.jpg" width={36} height={36} alt="Avatar" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuItem>Settings</DropdownMenuItem>
                            <DropdownMenuItem>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>
                <main className="flex-1 p-4 md:p-6 gap-4 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
