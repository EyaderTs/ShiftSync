export const USER_ENDPOINT = {
  list: `${import.meta.env.VITE_API}/users/get-users`,
  detail: `${import.meta.env.VITE_API}/users/get-user`,
  create: `${import.meta.env.VITE_API}/users/create-user`,
  update: `${import.meta.env.VITE_API}/users/update-user`,
  delete: `${import.meta.env.VITE_API}/users/delete-user`,
  archive: `${import.meta.env.VITE_API}/users/archive-user`,
  restore: `${import.meta.env.VITE_API}/users/restore-user`,
  user_profile: `${import.meta.env.VITE_API}/users/get-my-profile`,
}; 