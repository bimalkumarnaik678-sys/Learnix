export const isEmail = (s = '') => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(s);
export const required = (v) => v !== undefined && v !== null && String(v).trim() !== '';