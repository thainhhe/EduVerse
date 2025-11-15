import { NavLink } from "react-router-dom";

const SideBar = () => {
    const navItems = [
        { name: "Modules", path: "modules" },
        { name: "Room Meeting", path: "room-meeting" },
        { name: "Forums", path: "forums" },
        { name: "Announcements", path: "announcements" },
        { name: "Permissions", path: "permissions" },
    ];

    return (
        <aside className="w-64">
            <nav className="space-y-1 pt-4">
                {navItems.map((item) => (
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
