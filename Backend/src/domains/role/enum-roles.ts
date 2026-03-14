export enum EnumRoles {
  Admin = "Admin",
  Manager = "Manager",
  Staff = "Staff",
}
// Helper function to get all role values
export const getAllRoles = (): string[] => {
  return Object.values(EnumRoles);
};

// Helper function to check if a role exists
export const isValidRole = (role: string): boolean => {
  return Object.values(EnumRoles).includes(role as EnumRoles);
};
