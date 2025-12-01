import { useCourse } from "@/context/CourseProvider";
import { NavLink } from "react-router-dom";

const SideBar = () => {
    const { isMainInstructor, permissions } = useCourse();
    const navItems = [
        { name: "Modules", path: "modules", key: "manage_course" },
        { name: "Room Meeting", path: "room-meeting", key: "manage_roomeeting" },
        { name: "Forums", path: "forums", key: "manage_forum" },
        { name: "Learner", path: "learners", key: "view_course_students" },
        { name: "Announcements", path: "announcements", key: "announcements" },
        { name: "Reviews", path: "reviews", key: "manage_reviews" },
        { name: "Permissions", path: "permissions", key: "permissions" },
    ];
    const visibleNavItems = isMainInstructor
        ? navItems
        : navItems.filter((item) => permissions.includes(item.key));
    return (
        <aside className="w-54">
            <nav className="space-y-1">
                {visibleNavItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `block w-full px-3 py-2 text-sm font-medium ${
                                isActive
                                    ? "bg-white text-indigo-600 border border-white border-l-2 border-l-indigo-600"
                                    : "text-foreground hover:bg-muted"
                            }`
                        }
                    >
                        {item.name}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default SideBar;
