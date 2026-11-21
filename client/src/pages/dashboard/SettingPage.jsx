import { useEffect, useState } from "react";
import { LogOut, Monitor, Moon, Sun, Undo2 } from "lucide-react";
import Select from "../../components/ui/Select";
import { FREQUENCY_OPTIONS } from "../../utils/options";
import { useConfirm } from "../../context/ConfirmContext";
import useSignOut from "../../hooks/useSignOut";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { userApi, getErrorMessage } from "../../services/api";
import Segmented from "../../components/ui/Segmented";
import Avatar from "../../components/ui/Avatar";
import { Skeleton } from "../../components/ui/Skeleton";

function Section({ title, description, children }) {
  return (
    <section className="card">
      <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[220px_1fr]">
        <div>
          <h2 className="font-semibold text-ink">{title}</h2>
          {description && <p className="mt-1 text-[13px] text-muted">{description}</p>}
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const confirm = useConfirm();
  const signOut = useSignOut();
  const { theme, setTheme } = useTheme();
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    userApi
      .me()
      .then((u) => {
        const f = {
          firstName: u.firstName ?? "",
          lastName: u.lastName ?? "",
          email: u.email ?? "",
          defaultFreq: u.defaultFreq ?? "Daily",
        };
        setForm(f);
        setSaved(f);
      })
      .catch((err) => toast.error(getErrorMessage(err, "Couldn't load your settings")));
  }, []);

  const dirty = form && saved && JSON.stringify(form) !== JSON.stringify(saved);
  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const er = {};
    if (!form.firstName.trim()) er.firstName = "Required";
    if (!form.lastName.trim()) er.lastName = "Required";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) er.email = "Enter a valid email";
    setErrors(er);
    if (Object.keys(er).length) return;

    setSaving(true);
    try {
      const body = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        defaultFreq: form.defaultFreq,
      };
      if (theme !== "system") body.theme = theme;
      const u = await userApi.update(body);
      const next = { firstName: u.firstName, lastName: u.lastName, email: u.email, defaultFreq: u.defaultFreq };
      setForm(next);
      setSaved(next);
      updateUser({ firstName: u.firstName, lastName: u.lastName, email: u.email });
      toast.success("Settings saved");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't save your settings"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <form onSubmit={handleSave} className="space-y-6">
        <Section title="Profile" description="Your name and the email reminders are sent to.">
          {!form ? (
            <div className="space-y-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar user={form} size={44} />
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">
                    {`${form.firstName} ${form.lastName}`.trim() || "Your name"}
                  </p>
                  <p className="truncate text-[13px] text-faint">
                    Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : "—"}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="s-first" className="label">First name</label>
                  <input id="s-first" className="input" value={form.firstName} onChange={set("firstName")} aria-invalid={!!errors.firstName} autoComplete="given-name" />
                  {errors.firstName && <p className="field-error">{errors.firstName}</p>}
                </div>
                <div>
                  <label htmlFor="s-last" className="label">Last name</label>
                  <input id="s-last" className="input" value={form.lastName} onChange={set("lastName")} aria-invalid={!!errors.lastName} autoComplete="family-name" />
                  {errors.lastName && <p className="field-error">{errors.lastName}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="s-email" className="label">Email</label>
                <input id="s-email" type="email" className="input" value={form.email} onChange={set("email")} aria-invalid={!!errors.email} autoComplete="email" />
                {errors.email && <p className="field-error">{errors.email}</p>}
              </div>
            </div>
          )}
        </Section>

        <Section title="Reminders" description="How often recurring reminders repeat by default.">
          {form ? (
            <div className="max-w-xs">
              <label htmlFor="s-freq" className="label">Default frequency</label>
              <Select
                id="s-freq"
                value={form.defaultFreq}
                options={FREQUENCY_OPTIONS}
                onChange={(v) => setForm((f) => ({ ...f, defaultFreq: v }))}
              />
            </div>
          ) : (
            <Skeleton className="h-10 max-w-xs" />
          )}
        </Section>

        <div className="flex items-center justify-end gap-3">
          {dirty && <span className="text-[13px] text-muted">You have unsaved changes</span>}
          <button
            type="button"
            className="btn btn-secondary"
            disabled={!dirty || saving}
            onClick={async () => {
              const ok = await confirm({
                title: "Discard your changes?",
                description: "Your profile and reminder settings will go back to what's saved.",
                confirmLabel: "Discard",
                cancelLabel: "Keep editing",
                icon: Undo2,
              });
              if (ok) {
                setForm(saved);
                setErrors({});
              }
            }}
          >
            Discard
          </button>
          <button type="submit" className="btn btn-primary" disabled={!dirty || saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>

      <Section title="Appearance" description="Applies instantly on this device.">
        <div className="max-w-sm">
          <Segmented
            label="Theme"
            options={THEMES}
            value={theme}
            onChange={setTheme}
            renderOption={(o) => (
              <>
                <o.icon size={15} /> {o.label}
              </>
            )}
          />
        </div>
      </Section>

      <Section title="Session" description="Sign out of Efes Manager on this device.">
        <button className="btn btn-secondary" onClick={signOut}>
          <LogOut size={16} /> Sign out
        </button>
      </Section>
    </div>
  );
}
