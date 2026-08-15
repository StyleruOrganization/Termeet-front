export const CONTACT_EMAIL_PATTERN = "[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}";
export const CONTACT_TELEGRAM_PATTERN =
  "@?[A-Za-z][A-Za-z0-9_]{4,31}|https?://(t\\.me|telegram\\.me)/[A-Za-z][A-Za-z0-9_]{4,31}/?|t\\.me/[A-Za-z][A-Za-z0-9_]{4,31}/?";
export const CONTACT_VK_PATTERN =
  "(https?://)?(m\\.)?vk\\.com/[A-Za-z0-9._]+/?|id[0-9]{1,12}|[A-Za-z][A-Za-z0-9._]{2,31}|[0-9]{1,12}";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TELEGRAM_USER_RE = /^[A-Za-z][A-Za-z0-9_]{4,31}$/;
const VK_ID_RE = /^id\d{1,12}$/i;
const VK_SCREEN_RE = /^[A-Za-z][A-Za-z0-9._]{2,31}$/;
const VK_DIGITS_RE = /^\d{1,12}$/;

export type ContactParse = { valid: true; value: string | null } | { valid: false };

export const parseContactEmail = (raw: string): ContactParse => {
  const value = raw.trim();
  if (!value) {
    return { valid: true, value: null };
  }
  if (!EMAIL_RE.test(value)) {
    return { valid: false };
  }
  return { valid: true, value };
};

export const parseContactTelegram = (raw: string): ContactParse => {
  const value = raw.trim();
  if (!value) {
    return { valid: true, value: null };
  }
  let nick = value.replace(/^(https?:\/\/)?(t\.me|telegram\.me)\//i, "");
  nick = nick.replace(/^@/, "");
  nick = nick.replace(/\/$/, "");
  nick = nick.split("?")[0] ?? nick;
  if (!TELEGRAM_USER_RE.test(nick)) {
    return { valid: false };
  }
  return { valid: true, value: `@${nick}` };
};

export const parseContactVk = (raw: string): ContactParse => {
  const value = raw.trim();
  if (!value) {
    return { valid: true, value: null };
  }
  let slug = value.replace(/^(https?:\/\/)?(m\.)?vk\.com\//i, "");
  slug = slug.replace(/^@/, "");
  slug = slug.replace(/\/$/, "");
  slug = (slug.split("?")[0] ?? slug).split("/")[0] ?? slug;
  if (VK_DIGITS_RE.test(slug)) {
    return { valid: true, value: `id${slug}` };
  }
  if (VK_ID_RE.test(slug) || VK_SCREEN_RE.test(slug)) {
    return { valid: true, value: slug };
  }
  return { valid: false };
};
