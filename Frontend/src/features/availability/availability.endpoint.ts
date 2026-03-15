export const AVAILABILITY_ENDPOINT = {
  list: `${import.meta.env.VITE_API}/availability/get-availabilities`,
  detail: `${import.meta.env.VITE_API}/availability/get-availability`,
  create: `${import.meta.env.VITE_API}/availability/create-availability`,
  update: `${import.meta.env.VITE_API}/availability/update-availability`,
  delete: `${import.meta.env.VITE_API}/availability/delete-availability`,
  archive: `${import.meta.env.VITE_API}/availability/archive-availability`,
  restore: `${import.meta.env.VITE_API}/availability/restore-availability`,
}; 