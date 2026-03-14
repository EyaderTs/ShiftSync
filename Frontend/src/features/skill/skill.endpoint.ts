export const SKILL_ENDPOINT = {
  list: `${import.meta.env.VITE_API}/skills/get-skills`,
  detail: `${import.meta.env.VITE_API}/skills/get-skill`,
  create: `${import.meta.env.VITE_API}/skills/create-skill`,
  update: `${import.meta.env.VITE_API}/skills/update-skill`,
  delete: `${import.meta.env.VITE_API}/skills/delete-skill`,
  archive: `${import.meta.env.VITE_API}/skills/archive-skill`,
  restore: `${import.meta.env.VITE_API}/skills/restore-skill`,
}; 