export const DEMO_PASSWORD_KEY = "campusly-demo-password-v1";

const REQUIRED_PROFILE_FIELDS = [
  "photo",
  "gender",
  "aadhaar",
  "address",
  "bloodGroup",
  "birthDate",
  "birthPlace",
  "motherTongue",
  "email",
  "phone",
  "education",
];

export function getMissingStudentProfileFields(profile = {}) {
  return REQUIRED_PROFILE_FIELDS.filter((field) => !String(profile[field] || "").trim());
}

export function getStudentProfileFieldErrors(profile = {}) {
  const errors = {};
  const labels = {
    photo: "Add a profile photo.",
    gender: "Select your gender.",
    aadhaar: "Enter your 12-digit Aadhaar number.",
    address: "Enter your residential address.",
    bloodGroup: "Select your blood group.",
    birthDate: "Enter your date of birth.",
    birthPlace: "Enter your place of birth.",
    motherTongue: "Enter your mother tongue.",
    email: "Enter your email address.",
    phone: "Enter your phone number.",
    education: "Add at least one education qualification.",
  };

  for (const field of getMissingStudentProfileFields(profile)) {
    errors[field] = labels[field];
  }
  if (profile.aadhaar && !/^\d{12}$/.test(profile.aadhaar)) {
    errors.aadhaar = "Aadhaar number must contain exactly 12 digits.";
  }
  if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (profile.phone) {
    const phoneDigits = profile.phone.replace(/\D/g, "");
    const validPhone =
      (phoneDigits.length === 10 && /^[6-9]\d{9}$/.test(phoneDigits)) ||
      (phoneDigits.length === 12 && /^91[6-9]\d{9}$/.test(phoneDigits));
    if (!validPhone) {
      errors.phone = "Enter a valid 10-digit mobile number, with optional +91 country code.";
    }
  }
  if (!Array.isArray(profile.education) || profile.education.length === 0) {
    errors.education = "Add at least one education qualification.";
  } else {
    const educationValid = profile.education.every((item) =>
      ["qualification", "institute", "yearOfPassing", "percentage"].every((field) =>
        String(item?.[field] || "").trim(),
      ),
    );
    if (!educationValid) {
      errors.education =
        "Complete qualification, institute, year of passing, and percentage for each education entry.";
    }
  }
  return errors;
}

export function getStudentProfileValidationError(profile = {}) {
  return Object.values(getStudentProfileFieldErrors(profile))[0] || "";
}

export function getPasswordValidationError(password) {
  if (password.length < 8) return "Use at least 8 characters.";
  if (!/[a-z]/.test(password)) return "Add at least one lowercase letter.";
  if (!/[A-Z]/.test(password)) return "Add at least one uppercase letter.";
  if (!/\d/.test(password)) return "Add at least one number.";
  if (!/[^A-Za-z0-9\s]/.test(password)) return "Add at least one special character.";
  return "";
}

function toBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function derivePasswordHash(password, salt) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations: 120000, hash: "SHA-256" },
      key,
      256,
    ),
  );
}

export async function hashStudentPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePasswordHash(password, salt);
  return `v1:${toBase64(salt)}:${toBase64(hash)}`;
}

export async function verifyStudentPassword(password, savedHash) {
  const [version, encodedSalt, encodedHash] = String(savedHash || "").split(":");
  if (version !== "v1" || !encodedSalt || !encodedHash) return false;
  const expected = fromBase64(encodedHash);
  const actual = await derivePasswordHash(password, fromBase64(encodedSalt));
  return (
    actual.length === expected.length && actual.every((byte, index) => byte === expected[index])
  );
}
