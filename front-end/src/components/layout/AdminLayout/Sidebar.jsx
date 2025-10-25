import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Book,
  MessageSquare,
  BarChart2,
  Bot,
  Settings,
  Bell,
  UserCircle,
  Flag,
} from "lucide-react";
import { MdAutoAwesome } from "react-icons/md";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "Course Management", href: "#", icon: Book },
  { name: "Report Management", href: "/admin/reports", icon: Flag },
  { name: "Comment Management", href: "#", icon: MessageSquare },
  { name: "Notifications", href: "#", icon: Bell },
  { name: "Analytics", href: "#", icon: BarChart2 },
  { name: "Chatbot Management", href: "#", icon: Bot },
  { name: "System Settings", href: "#", icon: Settings },
  { name: "Admin Profile", href: "#", icon: UserCircle },
];

export function Sidebar({ className }) {
  const location = useLocation();

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 mb-6 px-4">
            <MdAutoAwesome className="text-3xl text-indigo-500" />
            <span className="text-2xl font-bold italic text-indigo-500">
              Eduverse
            </span>
          </div>
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  location.pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
