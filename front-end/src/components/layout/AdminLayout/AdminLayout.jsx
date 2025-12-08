import { useState } from "react";
import { cn } from "@/lib/utils";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Menu, ChevronRight, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isAuthenticated } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

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
                <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-black bg-background px-2 sm:h-16 sm:px-2">
                    <Menu className="h-5 w-5 lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)} />
                    {/* Desktop Sidebar Toggle */}
                    <Menu className="h-5 w-5" onClick={() => setIsCollapsed(!isCollapsed)} />
                    {/* Breadcrumbs */}
                    <nav className="hidden md:flex items-center text-sm text-muted-foreground">
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
                    <div className="flex-1 flex items-center justify-end gap-2">
                        {isAuthenticated && (
                            <Button
                                variant="outline"
                                className="flex items-center gap-2 text-green-500 hover:text-green-500"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-5 w-5" /> Logout
                            </Button>
                        )}
                    </div>
                </header>
                <main className="flex-1 px-2 md:p-2 gap-2 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
