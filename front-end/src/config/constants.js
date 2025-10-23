export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const WS_URL = import.meta.env.VITE_WS_URL;
export const APP_NAME = import.meta.env.VITE_APP_NAME;

export const USER_ROLES = {
  LEARNER: "learner",
  INSTRUCTOR: "instructor",
  ADMIN: "admin",
};

export const COURSE_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
};

export const NOTIFICATION_TYPES = {
  COURSE: "course",
  ASSIGNMENT: "assignment",
  FORUM: "forum",
  SYSTEM: "system",
};

export const QUIZ_TYPES = {
  MULTIPLE_CHOICE: "multiple_choice",
  TRUE_FALSE: "true_false",
  SHORT_ANSWER: "short_answer",
  ESSAY: "essay",
};
