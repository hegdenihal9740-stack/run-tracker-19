import { describe, expect, it } from "vitest";
import {
  getMissingStudentProfileFields,
  getPasswordValidationError,
  getStudentProfileFieldErrors,
  getStudentProfileValidationError,
  hashStudentPassword,
  verifyStudentPassword,
} from "../campusly/studentOnboarding";

describe("student onboarding", () => {
  it("requires the admission profile fields before portal access", () => {
    expect(getMissingStudentProfileFields()).toEqual([
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
    ]);
    expect(
      getMissingStudentProfileFields({
        photo: "photo-data",
        aadhaar: "123456789012",
        address: "Student address",
        bloodGroup: "O+",
        birthDate: "2000-01-01",
        email: "student@example.com",
        phone: "+91 9876543210",
        gender: "Other",
        birthPlace: "Bengaluru",
        motherTongue: "Kannada",
        education: [{ qualification: "BSc", institute: "University", yearOfPassing: "2025", percentage: "80%" }],
      }),
    ).toEqual([]);
  });

  it("rejects malformed Aadhaar, email, and phone values", () => {
    const profile = {
      photo: "photo-data",
      aadhaar: "123456789",
      address: "Student address",
      bloodGroup: "O+",
      birthDate: "2000-01-01",
      email: "student@example.com",
      phone: "9876543210",
      gender: "Other",
      birthPlace: "Bengaluru",
      motherTongue: "Kannada",
      education: [{ qualification: "BSc", institute: "University", yearOfPassing: "2025", percentage: "80%" }],
    };

    expect(getStudentProfileValidationError(profile)).toMatch(/Aadhaar.*12 digits/);
    expect(
      getStudentProfileValidationError({
        ...profile,
        aadhaar: "123456789012",
        email: "invalid-email",
      }),
    ).toMatch(/valid email/i);
    expect(
      getStudentProfileValidationError({
        ...profile,
        aadhaar: "123456789012",
        phone: "12345",
      }),
    ).toMatch(/valid 10-digit mobile number/i);
  });

  it("reports each missing field and identifies Aadhaar length errors", () => {
    expect(getStudentProfileFieldErrors()).toMatchObject({
      photo: "Add a profile photo.",
      gender: "Select your gender.",
      aadhaar: "Enter your 12-digit Aadhaar number.",
      address: "Enter your residential address.",
    });
    expect(
      getStudentProfileFieldErrors({
        photo: "photo",
        gender: "Other",
        aadhaar: "12345678901",
        address: "Address",
        bloodGroup: "O+",
        birthDate: "2000-01-01",
        birthPlace: "Bengaluru",
        motherTongue: "Kannada",
        email: "student@example.com",
        phone: "9876543210",
        education: [{ qualification: "BSc", institute: "University", yearOfPassing: "2025", percentage: "80%" }],
      }).aadhaar,
    ).toMatch(/exactly 12 digits/);
  });

  it("requires a long password with mixed case, a number, and a special character", () => {
    expect(getPasswordValidationError("short")).toMatch(/8 characters/);
    expect(getPasswordValidationError("longpassword1!")).toMatch(/uppercase/i);
    expect(getPasswordValidationError("Longpassword!")).toMatch(/number/i);
    expect(getPasswordValidationError("Longpassword1")).toMatch(/special character/i);
    expect(getPasswordValidationError("Long password1")).toMatch(/special character/i);
    expect(getPasswordValidationError("StrongPass1!")).toBe("");
  });

  it("verifies the changed demo password without storing it as plain text", async () => {
    const savedHash = await hashStudentPassword("A-secure-demo-password1!");

    expect(savedHash).not.toContain("A-secure-demo-password1!");
    expect(await verifyStudentPassword("A-secure-demo-password1!", savedHash)).toBe(true);
    expect(await verifyStudentPassword("incorrect-password", savedHash)).toBe(false);
  });
});
