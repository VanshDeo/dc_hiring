type JsonRecord = Record<string, any>;

export type ParsedSubmission = {
  fullName: string;
  email: string;
  department: string;
  country: string;
  city: string;
  location: string;
  accommodation: string;
  twitter: string;
  discord: string;
  linkedin: string;
  github: string;
  interests: string[];
  otherInterest: string;
  developmentSelections: string[];
  familiarity: string;
  excites: string;
  whyJoin: string;
  proud: string;
  timeCommit: string;
  fileName: string;
  resumeFilename: string;
  resumeBase64: string;
  resumeFile: File | null;
};

function toStringValue(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}

function parseMaybeJson(value: unknown) {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }

  return value;
}

function normalizeArrayValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((entry) => toStringValue(entry)).filter(Boolean);
  }

  const parsed = parseMaybeJson(value);

  if (Array.isArray(parsed)) {
    return parsed.map((entry) => toStringValue(entry)).filter(Boolean);
  }

  if (typeof parsed === 'string') {
    return parsed
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeObjectValue(value: unknown): JsonRecord {
  const parsed = parseMaybeJson(value);

  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return parsed as JsonRecord;
  }

  return {};
}

function splitLocation(location: string, country?: string, city?: string) {
  const resolvedCountry = toStringValue(country).trim();
  const resolvedCity = toStringValue(city).trim();
  const resolvedLocation = location.trim();

  if (resolvedCountry || resolvedCity) {
    return {
      country: resolvedCountry || resolvedLocation,
      city: resolvedCity,
      location: resolvedLocation,
    };
  }

  const parts = resolvedLocation.split(',').map((part) => part.trim()).filter(Boolean);

  return {
    country: parts[0] || resolvedLocation,
    city: parts.slice(1).join(', '),
    location: resolvedLocation,
  };
}

function getNestedString(source: JsonRecord, key: string) {
  return toStringValue(source[key]).trim();
}

export async function parseSubmissionRequest(request: Request): Promise<ParsedSubmission> {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const experience = normalizeObjectValue(formData.get('experience'));
    const contribution = normalizeObjectValue(formData.get('contribution'));

    const location = toStringValue(formData.get('location') || formData.get('country') || '').trim();
    const locationParts = splitLocation(location, toStringValue(formData.get('country')), toStringValue(formData.get('city')));
    const resumeCandidate =
      formData.get('resume') || formData.get('resumeFile') || formData.get('file') || formData.get('resumeUpload');

    return {
      fullName: toStringValue(formData.get('fullName')).trim(),
      email: toStringValue(formData.get('email')).trim(),
      department: toStringValue(formData.get('department')).trim(),
      country: locationParts.country,
      city: locationParts.city,
      location: locationParts.location,
      accommodation: toStringValue(formData.get('accommodation')).trim(),
      twitter: toStringValue(formData.get('twitter')).trim(),
      discord: toStringValue(formData.get('discord')).trim(),
      linkedin: toStringValue(formData.get('linkedin')).trim(),
      github: toStringValue(formData.get('github')).trim(),
      interests: normalizeArrayValue(formData.get('interests')),
      otherInterest: toStringValue(formData.get('otherInterest')).trim(),
      developmentSelections: normalizeArrayValue(formData.get('developmentSelections')),
      familiarity:
        toStringValue(formData.get('familiarity')).trim() || getNestedString(experience, 'familiarity'),
      excites: toStringValue(formData.get('excites')).trim() || getNestedString(experience, 'excites'),
      whyJoin: toStringValue(formData.get('whyJoin')).trim() || getNestedString(experience, 'whyJoin'),
      proud: toStringValue(formData.get('proud')).trim() || getNestedString(contribution, 'proud'),
      timeCommit: toStringValue(formData.get('timeCommit')).trim() || getNestedString(contribution, 'timeCommit'),
      fileName: toStringValue(formData.get('fileName')).trim() || toStringValue(formData.get('resumeFilename')).trim(),
      resumeFilename: toStringValue(formData.get('resumeFilename')).trim(),
      resumeBase64: toStringValue(formData.get('resumeBase64')).trim(),
      resumeFile: resumeCandidate instanceof File && resumeCandidate.size > 0 ? resumeCandidate : null,
    };
  }

  const body = (await request.json()) as JsonRecord;
  const experience = normalizeObjectValue(body.experience);
  const contribution = normalizeObjectValue(body.contribution);
  const location = toStringValue(body.location || body.city || body.country).trim();
  const locationParts = splitLocation(location, body.country, body.city);

  return {
    fullName: toStringValue(body.fullName).trim(),
    email: toStringValue(body.email).trim(),
    department: toStringValue(body.department).trim(),
    country: locationParts.country,
    city: locationParts.city,
    location: locationParts.location,
    accommodation: toStringValue(body.accommodation).trim(),
    twitter: toStringValue(body.twitter).trim(),
    discord: toStringValue(body.discord).trim(),
    linkedin: toStringValue(body.linkedin).trim(),
    github: toStringValue(body.github).trim(),
    interests: normalizeArrayValue(body.interests),
    otherInterest: toStringValue(body.otherInterest).trim(),
    developmentSelections: normalizeArrayValue(body.developmentSelections),
    familiarity: toStringValue(body.familiarity).trim() || getNestedString(experience, 'familiarity'),
    excites: toStringValue(body.excites).trim() || getNestedString(experience, 'excites'),
    whyJoin: toStringValue(body.whyJoin).trim() || getNestedString(experience, 'whyJoin'),
    proud: toStringValue(body.proud).trim() || getNestedString(contribution, 'proud'),
    timeCommit: toStringValue(body.timeCommit).trim() || getNestedString(contribution, 'timeCommit'),
    fileName: toStringValue(body.fileName).trim() || toStringValue(body.resumeFilename).trim(),
    resumeFilename: toStringValue(body.resumeFilename).trim(),
    resumeBase64: toStringValue(body.resumeBase64).trim(),
    resumeFile: null,
  };
}

export function buildSubmissionRow(
  submission: ParsedSubmission,
  file: { fileName: string; driveLink: string }
) {
  const resumeBase64Value =
    submission.resumeBase64.length > 48000
      ? file.driveLink || ''
      : submission.resumeBase64;

  return {
    fullName: submission.fullName,
    email: submission.email,
    department: submission.department,
    location: submission.location,
    accomodation: submission.accommodation,
    twitter: submission.twitter,
    discord: submission.discord,
    linkedin: submission.linkedin,
    github: submission.github,
    resumeFileName: file.fileName || submission.fileName || submission.resumeFilename,
    resumeBase64: resumeBase64Value,
    interests: submission.interests.join(', '),
    otherInterest: submission.otherInterest,
    developmentSections: submission.developmentSelections.join(', '),
    familiarity: submission.familiarity,
    excites: submission.excites,
    whyJoin: submission.whyJoin,
    proud: submission.proud,
    timeCommit: submission.timeCommit,
  };
}
