const PERMISSIONS = {
    MANAGE_USERS: "manage_users",
    MANAGE_COURSES: "manage_courses",
    SYSTEM_SETTINGS: "system_settings",
    ACCESS_ANALYTICS_DASHBOARD: "access_analytics_dashboard",
    SEND_NOTIFICATIONS: "send_notifications",
    MANAGE_REPORTS: "manage_reports",
    MANAGE_CATEGORIES: "manage_categories",
    ACCESS_PERMISSION_SETTINGS: "access_permission_settings",
    VIEW_LOGS: "view_logs",
    ///Course
    MANAGE_OWN_COURSES: "manage_own_courses",
    MANAGE_FORUM: "manage_forum",
    ACCESS_ANALYTICS: "access_analytics",
    ///Student
    ACCESS_COURSE_MATERIALS: "access_course_materials",
    PARTICIPATE_IN_FORUMS: "participate_in_forums",
    VIEW_GRADES: "view_grades",
};

const ROLE = {
    ADMIN: "admin",
    INSTRUCTOR: "instructor",
    LEARNER: "learner",
};

module.exports = { PERMISSIONS, ROLE };
