import { NavLink } from "react-router-dom";

const SideBar = () => {
  const navItems = [
    { name: "Modules", path: "modules" },
    { name: "Room Meeting", path: "room-meeting" },
    { name: "Announcements", path: "announcements" },
  ];

  return (
    <aside className="w-64 p-4">
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block w-full rounded-md px-3 py-2 text-sm font-medium ${
                isActive
                  ? "bg-muted text-indigo-600"
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
