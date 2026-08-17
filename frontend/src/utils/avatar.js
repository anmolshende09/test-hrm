// §6 requires every user to show an avatar, but §8.1's Add New User form has
// no image upload field — so avatars are generated client-side from
// initials rather than stored on the User model.

const PALETTE = ["#0066cc", "#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2", "#db2777", "#4f46e5"];

export const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

export const getAvatarColor = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
};
