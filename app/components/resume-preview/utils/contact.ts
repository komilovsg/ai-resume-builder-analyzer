interface ContactSegment {
  text: string;
  href?: string;
  isBracketed?: boolean;
}

const ensureProtocol = (value: string) => {
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

const formatTelegramHref = (value: string) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  const handle = value.replace(/^@/, "").replace(/^t\.me\//i, "");
  return `https://t.me/${handle}`;
};

const formatPhoneHref = (value: string) => {
  if (!value) return "";
  const digits = value.replace(/[^\d+]/g, "");
  return `tel:${digits}`;
};

const extractHandle = (value: string) => {
  if (!value) return "";
  return value
    .replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "")
    .replace(/^https?:\/\/(www\.)?t\.me\//i, "")
    .replace(/^@/, "")
    .replace(/\/$/, "");
};

const buildLinkedTelegramSegment = (resumeData: ResumeData): ContactSegment | null => {
  if (!resumeData.linkedin && !resumeData.telegram) {
    return null;
  }

  const labelParts = [];
  if (resumeData.linkedin) labelParts.push("LinkedIn");
  if (resumeData.telegram) labelParts.push("Telegram");

  const handle =
    extractHandle(resumeData.telegram || "") || extractHandle(resumeData.linkedin || "");

  return {
    text: `${labelParts.join("&")}${handle ? `/${handle}` : ""}`,
    href: resumeData.linkedin
      ? ensureProtocol(resumeData.linkedin)
      : formatTelegramHref(resumeData.telegram || ""),
    isBracketed: true,
  };
};

export const buildContactSegments = (resumeData: ResumeData): ContactSegment[] => {
  const segments: ContactSegment[] = [];

  if (resumeData.location) {
    segments.push({
      text: resumeData.location,
    });
  }

  if (resumeData.email) {
    segments.push({
      text: resumeData.email,
      href: `mailto:${resumeData.email}`,
    });
  }

  if (resumeData.phone) {
    segments.push({
      text: resumeData.phone,
      href: formatPhoneHref(resumeData.phone),
    });
  }

  const linkedTelegramSegment = buildLinkedTelegramSegment(resumeData);
  if (linkedTelegramSegment) {
    segments.push(linkedTelegramSegment);
  }

  return segments;
};


