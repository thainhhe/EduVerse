import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Book,
    Bot,
    Bell,
    UserCircle,
    CreditCard,
    ChevronDown,
    Settings,
} from "lucide-react";
import { MdAutoAwesome } from "react-icons/md";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
    {
        name: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
        children: [
            { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
            { name: "Enrollment", href: "/admin/enrollment", icon: LayoutDashboard },
            { name: "Revenue", href: "/admin/revenue", icon: LayoutDashboard },
            { name: "Instructor Revenue", href: "/admin/revenue/instructors", icon: LayoutDashboard },
        ],
    },
    { name: "User Management", href: "/admin/users", icon: Users },
    {
        name: "Course Management",
        icon: Book,
        children: [
            { name: "Courses", href: "/admin/courses" },
            { name: "Categories", href: "/admin/categories" },
        ],
    },
    { name: "Payment Management", href: "/admin/payment", icon: CreditCard },
    { name: "Notifications", href: "/admin/notifications", icon: Bell },
    { name: "Chatbot Management", href: "/admin/chatbot", icon: Bot },
    { name: "System Management", href: "/admin/system", icon: Settings },
    { name: "Admin Profile", href: "/admin/profile", icon: UserCircle },
];

export function Sidebar({ className, isCollapsed }) {
    const location = useLocation();
    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (name) => {
        setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
    };

    const isActive = (item) => {
        if (item.href) {
            return location.pathname.includes(item.href);
        }
        if (item.children) {
            return item.children.some((child) => location.pathname.includes(child.href));
        }
        return false;
    };

    return (
        <div
            className={cn(
                "flex flex-col h-full bg-slate-900 text-slate-300 transition-all duration-300 border-r border-slate-800 shadow-xl",
                className
            )}
        >
            {/* Logo Section */}
            <div className="h-16 flex items-center px-6 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
                <div
                    className={cn(
                        "flex items-center gap-3 transition-all duration-300",
                        isCollapsed ? "justify-center w-full" : ""
                    )}
                >
                    <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
                        <MdAutoAwesome className="text-xl text-white" />
                    </div>
                    {!isCollapsed && (
                        <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            Eduverse
                        </span>
                    )}
                </div>
            </div>

            {/* Navigation Section */}
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                {navigation.map((item) => {
                    // Handle Children
                    if (item.children) {
                        const isOpen = openMenus[item.name] || isActive(item);
                        const isChildActive = item.children.some((child) =>
                            location.pathname.includes(child.href)
                        );

                        // If collapsed, show DropdownMenu
                        if (isCollapsed) {
                            return (
                                <DropdownMenu key={item.name}>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            className={cn(
                                                "group flex w-full items-center justify-center rounded-xl px-2 py-2.5 text-sm font-medium transition-all duration-200",
                                                isChildActive
                                                    ? "bg-indigo-600/10 text-indigo-400"
                                                    : "hover:bg-slate-800/50 hover:text-white"
                                            )}
                                            title={item.name}
                                        >
                                            <item.icon
                                                className={cn(
                                                    "h-5 w-5 transition-colors",
                                                    isChildActive
                                                        ? "text-indigo-400"
                                                        : "text-slate-400 group-hover:text-white"
                                                )}
                                            />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        side="right"
                                        align="start"
                                        className="bg-slate-900 border-slate-800 text-slate-300 ml-2 w-48"
                                    >
                                        <DropdownMenuLabel className="text-white">
                                            {item.name}
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-slate-800" />
                                        {item.children.map((child) => (
                                            <DropdownMenuItem key={child.name} asChild>
                                                <Link
                                                    to={child.href}
                                                    className={cn(
                                                        "cursor-pointer hover:bg-slate-800 focus:bg-slate-800 focus:text-white",
                                                        location.pathname === child.href
                                                            ? "text-indigo-400 bg-indigo-600/10"
                                                            : ""
                                                    )}
                                                >
                                                    {child.name}
                                                </Link>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            );
                        }

                        // If expanded, show Collapsible
                        return (
                            <Collapsible
                                key={item.name}
                                open={isOpen}
                                onOpenChange={() => toggleMenu(item.name)}
                                className="w-full"
                            >
                                <CollapsibleTrigger asChild>
                                    <button
                                        className={cn(
                                            "group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                            isChildActive
                                                ? "bg-indigo-600/10 text-indigo-400"
                                                : "hover:bg-slate-800/50 hover:text-white"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon
                                                className={cn(
                                                    "h-5 w-5 transition-colors",
                                                    isChildActive
                                                        ? "text-indigo-400"
                                                        : "text-slate-400 group-hover:text-white"
                                                )}
                                            />
                                            <span>{item.name}</span>
                                        </div>
                                        <ChevronDown
                                            className={cn(
                                                "h-4 w-4 text-slate-500 transition-transform duration-200",
                                                isOpen ? "rotate-180" : ""
                                            )}
                                        />
                                    </button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-1 space-y-1">
                                    {/* Thread Line Container */}
                                    <div className="relative ml-5 pl-4 border-l-2 border-slate-800 space-y-1">
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.name}
                                                to={child.href}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 relative group/child",
                                                    location.pathname === child.href
                                                        ? "text-white bg-indigo-600 shadow-md shadow-indigo-500/20"
                                                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                                )}
                                            >
                                                {/* Horizontal Connector Line */}
                                                <span
                                                    className={cn(
                                                        "absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-[2px] transition-colors",
                                                        location.pathname === child.href
                                                            ? "bg-indigo-600"
                                                            : "bg-slate-800 group-hover/child:bg-slate-600"
                                                    )}
                                                />
                                                {child.name}
                                            </Link>
                                        ))}
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        );
                    }

                    // Standard Item
                    const active = isActive(item);

                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={cn(
                                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 relative overflow-hidden",
                                active
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                                    : "hover:bg-slate-800/50 hover:text-white",
                                isCollapsed ? "justify-center px-2" : ""
                            )}
                            title={isCollapsed ? item.name : ""}
                        >
                            <item.icon
                                className={cn(
                                    "h-5 w-5 transition-colors relative z-10",
                                    active ? "text-white" : "text-slate-400 group-hover:text-white"
                                )}
                            />
                            {!isCollapsed && <span className="relative z-10">{item.name}</span>}
                            {active && (
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-500 opacity-100 z-0" />
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* User Profile Section */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <div
                    className={cn(
                        "flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-slate-800/50 cursor-pointer group",
                        isCollapsed ? "justify-center" : ""
                    )}
                >
                    <Avatar className="h-9 w-9 border-2 border-slate-700 group-hover:border-indigo-500 transition-colors">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback className="bg-indigo-600 text-white">AD</AvatarFallback>
                    </Avatar>
                    {!isCollapsed && (
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">Admin User</p>
                            <p className="text-xs text-slate-500 truncate">admin@eduverse.com</p>
                        </div>
                    )}
                    {!isCollapsed && (
                        <Settings className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
                    )}
                </div>
            </div>
        </div>
    );
}
