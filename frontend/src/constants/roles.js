export const ROLES = {
  ADMIN: "admin",
  HR_MANAGER: "hr_manager",
  EMPLOYEE: "employee",
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.HR_MANAGER]: "HR Manager",
  [ROLES.EMPLOYEE]: "Employee",
};

// Roles allowed to manage employees, departments, attendance marking, announcements
export const MANAGER_ROLES = [ROLES.ADMIN, ROLES.HR_MANAGER];
