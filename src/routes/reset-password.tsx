import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { LockKeyhole, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCloudAuth } from "@/components/auth-provider";
import { saveRecoveryPassword } from "@/campusly/cloudAuth";
import { supabase } from "@/integrations/supabase/client";
import "@/campusly/campusly.css";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password | Skill AI" },
      { name: "description", content: "Securely reset your Skill AI student account password." },
      { property: "og:title", content: "Reset password | Skill AI" },
      {
        property: "og:description",
        content: "Set a new password for your Skill AI student account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const { user, ready, recovery } = useCloudAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !recovery) return;
    if (password !== confirm) return setError("Passwords do not match.");
    setBusy(true);
    setError("");
    try {
      const { error } = await saveRecoveryPassword(password);
      if (error) {
        setError(error.message);
        return;
      }
      sessionStorage.removeItem("skillai-recovery");
      await supabase.auth.signOut();
      setDone(true);
    } catch {
      setError("Could not update your password. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login-main min-h-screen">
      <form className="login-form" onSubmit={submit}>
        <div className="login-heading">
          <span className="eyebrow">SKILL AI</span>
          <h2>{done ? "Password updated" : "Reset password"}</h2>
        </div>
        {!ready ? (
          <p role="status">Checking your reset link…</p>
        ) : done ? (
          <p>Your new password is ready.</p>
        ) : !user || !recovery ? (
          <p role="alert">
            This reset link is invalid or expired. Request a new link from Forgot password.
          </p>
        ) : (
          <>
            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}
            <label className="field-label" htmlFor="new-password">
              New password
            </label>
            <div className="input-wrap">
              <LockKeyhole size={18} />
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <label className="field-label" htmlFor="confirm-password">
              Confirm password
            </label>
            <div className="input-wrap">
              <LockKeyhole size={18} />
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <Button className="primary-button login-submit h-auto" type="submit" disabled={busy}>
              {busy ? "Updating…" : "Update password"}
              <ArrowRight size={17} />
            </Button>
          </>
        )}
        <Button asChild variant="link" className="link-button mt-4">
          <Link to="/">Back to sign in</Link>
        </Button>
      </form>
    </main>
  );
}
