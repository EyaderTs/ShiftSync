export const SHIFT_ENDPOINT = {
  list: `${import.meta.env.VITE_API}/shifts/get-shifts`,
  detail: `${import.meta.env.VITE_API}/shifts/get-shift`,
  create: `${import.meta.env.VITE_API}/shifts/create-shift`,
  update: `${import.meta.env.VITE_API}/shifts/update-shift`,
  delete: `${import.meta.env.VITE_API}/shifts/delete-shift`,
  archive: `${import.meta.env.VITE_API}/shifts/archive-shift`,
  restore: `${import.meta.env.VITE_API}/shifts/restore-shift`,
  publish: `${import.meta.env.VITE_API}/shifts/publish-shift`,
  assignStaff: `${import.meta.env.VITE_API}/shifts/assign-staff`,
};
