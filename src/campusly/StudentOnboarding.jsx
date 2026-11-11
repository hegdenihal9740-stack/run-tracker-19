import { useState } from "react";
import { Camera, Check, LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { USER, profileKey } from "./data.js";
import {
  DEMO_PASSWORD_KEY,
  getPasswordValidationError,
  getStudentProfileFieldErrors,
  getStudentProfileValidationError,
  hashStudentPassword,
} from "./studentOnboarding.js";
import "./student-onboarding.css";

function readStudentPhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, 640 / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Photo processing is unavailable."));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.onerror = () => reject(new Error("Choose a valid JPG, PNG, or WebP photo."));
      image.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("The photo could not be read."));
    reader.readAsDataURL(file);
  });
}

function readSavedProfile() {
  try {
    return JSON.parse(localStorage.getItem(profileKey()) || "null") || {};
  } catch {
    return {};
  }
}

export default function StudentOnboarding({ step, onPasswordChanged, onProfileCompleted }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profile, setProfile] = useState(() => {
    const savedProfile = readSavedProfile();
    return {
      ...savedProfile,
      name: USER.name || "",
      studentId: USER.studentId || "",
      applicationNo: USER.applicationNo || "",
      photo: savedProfile.photo || USER.photo || "",
      aadhaar: (savedProfile.aadhaar || USER.aadhaar || "").replace(/\D/g, "").slice(0, 12),
      gender: savedProfile.gender || USER.gender || "",
      birthDate: savedProfile.birthDate || USER.birthDate || "",
      birthPlace: savedProfile.birthPlace || USER.birthPlace || "",
      motherTongue: savedProfile.motherTongue || USER.motherTongue || "",
      bloodGroup: savedProfile.bloodGroup || USER.bloodGroup || "",
      email: savedProfile.email || USER.email || "",
      phone: savedProfile.phone || USER.phone || "",
      address: savedProfile.address || USER.address || "",
      education:
        Array.isArray(savedProfile.education) && savedProfile.education.length
          ? savedProfile.education
          : Array.isArray(USER.education) && USER.education.length
            ? USER.education.map((item) => ({ ...item }))
            : [{ qualification: "", institute: "", yearOfPassing: "", percentage: "" }],
    };
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [profileSubmitted, setProfileSubmitted] = useState(false);
  const profileFieldErrors = profileSubmitted ? getStudentProfileFieldErrors(profile) : {};
  const fieldValidationProps = (field) => ({
    "aria-invalid": Boolean(profileFieldErrors[field]),
    "aria-describedby": profileFieldErrors[field] ? `profile-${field}-error` : undefined,
  });
  const fieldError = (field) =>
    profileFieldErrors[field] ? (
      <small className="student-field-error" id={`profile-${field}-error`} role="alert">
        {profileFieldErrors[field]}
      </small>
    ) : null;

  async function changePassword(event) {
    event.preventDefault();
    setError("");
    const passwordError = getPasswordValidationError(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const passwordHash = await hashStudentPassword(password);
      localStorage.setItem(DEMO_PASSWORD_KEY, passwordHash);
      onPasswordChanged();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The password could not be updated.");
    } finally {
      setBusy(false);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    setProfileSubmitted(true);
    setError("");
    const validationError = getStudentProfileValidationError(profile);
    if (validationError) {
      setError(validationError);
      return;
    }
    setBusy(true);
    try {
      localStorage.setItem(profileKey(), JSON.stringify(profile));
      onProfileCompleted();
    } catch {
      setError(
        "Your profile could not be saved in this browser. Check available storage and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  const setField = (field) => (event) =>
    setProfile((current) => ({ ...current, [field]: event.target.value }));

  const setEducationField = (index, field) => (event) =>
    setProfile((current) => ({
      ...current,
      education: current.education.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: event.target.value } : item,
      ),
    }));

  const addEducation = () =>
    setProfile((current) => ({
      ...current,
      education: [
        ...current.education,
        { qualification: "", institute: "", yearOfPassing: "", percentage: "" },
      ],
    }));

  return (
    <main className="student-onboarding-page">
      <section className="student-onboarding-card">
        <div className="student-onboarding-brand">
          <span>
            <ShieldCheck size={18} />
          </span>{" "}
          SKILL AI · STUDENT PORTAL
        </div>
        <div className="student-onboarding-progress">
          <span className={step === "password" ? "current" : "complete"}>1</span>
          <i />
          <span className={step === "profile" ? "current" : ""}>2</span>
        </div>
        {step === "password" ? (
          <form onSubmit={changePassword} noValidate>
            <div className="student-onboarding-icon">
              <LockKeyhole size={22} />
            </div>
            <h1>Set your new password</h1>
            <p>
              Your admission team provided a temporary password. Create a private password to
              continue.
            </p>
            {error && (
              <div className="student-onboarding-error" role="alert">
                {error}
              </div>
            )}
            <label htmlFor="new-student-password">New password</label>
            <input
              id="new-student-password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <label htmlFor="confirm-student-password">Confirm new password</label>
            <input
              id="confirm-student-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            <p className="student-password-hint">
              Use at least 8 characters, including an uppercase letter, a lowercase letter, a
              number, and a special character.
            </p>
            <Button
              className="primary-button student-onboarding-submit"
              type="submit"
              disabled={busy}
            >
              {busy ? "Saving…" : "Change password"} <Check size={16} />
            </Button>
          </form>
        ) : (
          <form onSubmit={saveProfile} noValidate>
            <div className="student-onboarding-icon">
              <Camera size={22} />
            </div>
            <h1>Complete your student profile</h1>
            <p>Fill in your personal details before continuing to the learning portal.</p>
            {error && (
              <div className="student-onboarding-error" role="alert">
                {error}
              </div>
            )}
            <label className="student-photo-upload">
              {profile.photo ? (
                <img src={profile.photo} alt="Selected student profile" />
              ) : (
                <Camera size={20} />
              )}
              <span>
                {profile.photo ? "Change profile photo" : "Add profile photo"}{" "}
                <small>JPG, PNG, or WebP</small>
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required={!profile.photo}
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  setError("");
                  if (file.size > 8 * 1024 * 1024) {
                    setError("Choose a photo smaller than 8 MB.");
                    return;
                  }
                  try {
                    const photo = await readStudentPhoto(file);
                    setProfile((current) => ({ ...current, photo }));
                  } catch (reason) {
                    setError(
                      reason instanceof Error
                        ? reason.message
                        : "The photo could not be processed.",
                    );
                  }
                }}
              />
            </label>
            {fieldError("photo")}
            <div className="student-onboarding-fields">
              <label>
                Full name
                <input value={profile.name} readOnly />
              </label>
              <label>
                Registration number
                <input value={profile.studentId} readOnly />
              </label>
              <label>
                Application number
                <input
                  value={profile.applicationNo}
                  readOnly
                  placeholder="Not provided by admission team"
                />
              </label>
              <label>
                Email address
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={profile.email || ""}
                  {...fieldValidationProps("email")}
                  onChange={setField("email")}
                />
                {fieldError("email")}
              </label>
              <label>
                Phone number
                <input
                  type="tel"
                  autoComplete="tel"
                  required
                  value={profile.phone || ""}
                  {...fieldValidationProps("phone")}
                  onChange={setField("phone")}
                />
                {fieldError("phone")}
              </label>
              <label>
                Gender
                <select
                  required
                  value={profile.gender || ""}
                  {...fieldValidationProps("gender")}
                  onChange={setField("gender")}
                >
                  <option value="">Select gender</option>
                  {["Female", "Male", "Other", "Prefer not to say"].map((gender) => (
                    <option key={gender}>{gender}</option>
                  ))}
                </select>
                {fieldError("gender")}
              </label>
              <label>
                Date of birth
                <input
                  type="date"
                  required
                  value={profile.birthDate || ""}
                  {...fieldValidationProps("birthDate")}
                  onChange={setField("birthDate")}
                />
                {fieldError("birthDate")}
              </label>
              <label>
                Place of birth
                <input
                  required
                  autoComplete="address-level2"
                  value={profile.birthPlace || ""}
                  {...fieldValidationProps("birthPlace")}
                  onChange={setField("birthPlace")}
                />
                {fieldError("birthPlace")}
              </label>
              <label>
                Mother tongue
                <input
                  required
                  value={profile.motherTongue || ""}
                  {...fieldValidationProps("motherTongue")}
                  onChange={setField("motherTongue")}
                />
                {fieldError("motherTongue")}
              </label>
              <label>
                Blood group
                <select
                  required
                  value={profile.bloodGroup || ""}
                  {...fieldValidationProps("bloodGroup")}
                  onChange={setField("bloodGroup")}
                >
                  <option value="">Select blood group</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                    <option key={group}>{group}</option>
                  ))}
                </select>
                {fieldError("bloodGroup")}
              </label>
              <label>
                Aadhaar number
                <input
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={12}
                  pattern="[0-9]{12}"
                  required
                  value={profile.aadhaar || ""}
                  {...fieldValidationProps("aadhaar")}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      aadhaar: event.target.value.replace(/\D/g, "").slice(0, 12),
                    }))
                  }
                />
                <small className="student-field-hint">
                  Enter exactly 12 digits as printed on your Aadhaar card.
                </small>
                {fieldError("aadhaar")}
              </label>
              <label className="student-onboarding-address">
                Residential address
                <textarea
                  required
                  rows={3}
                  value={profile.address || ""}
                  {...fieldValidationProps("address")}
                  onChange={setField("address")}
                />
                {fieldError("address")}
              </label>
            </div>
            <section className="student-onboarding-education">
              <div className="student-onboarding-section-heading">
                <h2>Education information</h2>
                <button type="button" onClick={addEducation}>
                  Add qualification
                </button>
              </div>
              {profile.education.map((item, index) => (
                <div className="student-onboarding-education-row" key={index}>
                  <label>
                    Qualification / course
                    <input
                      required
                      value={item.qualification || ""}
                      onChange={setEducationField(index, "qualification")}
                    />
                  </label>
                  <label>
                    Institute / university
                    <input
                      required
                      value={item.institute || ""}
                      onChange={setEducationField(index, "institute")}
                    />
                  </label>
                  <label>
                    Year of passing
                    <input
                      inputMode="numeric"
                      maxLength={4}
                      required
                      value={item.yearOfPassing || ""}
                      onChange={setEducationField(index, "yearOfPassing")}
                    />
                  </label>
                  <label>
                    Percentage / grade
                    <input
                      required
                      value={item.percentage || ""}
                      onChange={setEducationField(index, "percentage")}
                    />
                  </label>
                  {profile.education.length > 1 && (
                    <button
                      className="student-onboarding-remove-education"
                      type="button"
                      onClick={() =>
                        setProfile((current) => ({
                          ...current,
                          education: current.education.filter((_, itemIndex) => itemIndex !== index),
                        }))
                      }
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {fieldError("education")}
            </section>
            <Button
              className="primary-button student-onboarding-submit"
              type="submit"
              disabled={busy}
            >
              {busy ? "Saving…" : "Save profile and continue"} <Check size={16} />
            </Button>
          </form>
        )}
      </section>
    </main>
  );
}
