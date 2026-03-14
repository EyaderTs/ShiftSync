export const LOCATION_ENDPOINT = {
  list: `${import.meta.env.VITE_API}/locations/get-locations`,
  detail: `${import.meta.env.VITE_API}/locations/get-location`,
  create: `${import.meta.env.VITE_API}/locations/create-location`,
  update: `${import.meta.env.VITE_API}/locations/update-location`,
  delete: `${import.meta.env.VITE_API}/locations/delete-location`,
  archive: `${import.meta.env.VITE_API}/locations/archive-location`,
  restore: `${import.meta.env.VITE_API}/locations/restore-location`,
};
