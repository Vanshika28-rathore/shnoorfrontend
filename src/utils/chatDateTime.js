const NO_TIMEZONE_REGEX = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/;
const HAS_TIMEZONE_REGEX = /(Z|[+-]\d{2}:?\d{2})$/i;
const IST_OFFSET = "+05:30";

export const parseChatDate = (rawValue) => {
  if (rawValue instanceof Date) {
    return Number.isNaN(rawValue.getTime()) ? null : rawValue;
  }

  if (typeof rawValue === "number") {
    const parsedFromNumber = new Date(rawValue);
    return Number.isNaN(parsedFromNumber.getTime()) ? null : parsedFromNumber;
  }

  if (!rawValue) return null;

  const normalized = String(rawValue).trim();
  if (!normalized) return null;

  const normalizedIso = normalized.replace(" ", "T");

  const valueWithTimezone = NO_TIMEZONE_REGEX.test(normalized)
    ? HAS_TIMEZONE_REGEX.test(normalizedIso)
      ? normalizedIso
      : `${normalizedIso}${IST_OFFSET}`
    : normalizedIso;

  const parsed = new Date(valueWithTimezone);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatChatTime = (rawValue) => {
  const parsed = parseChatDate(rawValue);
  if (!parsed) return "-";

  return parsed.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatChatDate = (rawValue) => {
  const parsed = parseChatDate(rawValue);
  if (!parsed) return "-";

  return parsed.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatChatDateTime = (rawValue) => {
  const parsed = parseChatDate(rawValue);
  if (!parsed) return "-";

  return parsed.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
