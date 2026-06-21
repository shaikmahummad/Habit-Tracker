const pad = (n) => String(n).padStart(2, '0');

export const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const formatDateString = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const daysBetween = (a, b) => {
  const ms = 24 * 60 * 60 * 1000;
  const da = new Date(a);
  const db = new Date(b);
  return Math.round((db - da) / ms);
};
