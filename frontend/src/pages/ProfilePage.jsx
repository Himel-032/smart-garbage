import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  Loader2,
  PencilLine,
  UploadCloud,
  UserCircle2,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProfilePage() {
  const { admin, updateAdminProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!admin) return;

    setFormData({
      name: admin.name || "",
      email: admin.email || "",
      phone: admin.phone || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPhotoPreview(admin.photo_url || null);
    setPhotoFile(null);
  }, [admin]);

  useEffect(() => {
    return () => {
      if (photoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const initials = useMemo(() => {
    if (!admin?.name) return "A";

    return admin.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((chunk) => chunk[0]?.toUpperCase())
      .join("");
  }, [admin]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (photoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim().toLowerCase();

    if (!trimmedName) {
      toast.error("Name is required");
      return;
    }

    if (!trimmedEmail) {
      toast.error("Email is required");
      return;
    }

    if (formData.newPassword && !formData.currentPassword) {
      toast.error("Current password is required to change password");
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    try {
      setLoading(true);

      const payload = new FormData();
      payload.append("name", trimmedName);
      payload.append("email", trimmedEmail);
      payload.append("phone", formData.phone.trim());

      if (formData.currentPassword) {
        payload.append("currentPassword", formData.currentPassword);
      }

      if (formData.newPassword) {
        payload.append("newPassword", formData.newPassword);
      }

      if (photoFile) {
        payload.append("photo", photoFile);
      }

      await updateAdminProfile(payload);

      toast.success("Profile updated successfully");
      setFormData((current) => ({
        ...current,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setPhotoFile(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!admin) return null;

  return (
    <DashboardLayout>
      <div className="relative overflow-hidden px-6 py-8">
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-emerald-50 via-white to-slate-100" />
        <div className="absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-emerald-200/35 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 -z-10 h-64 w-64 rounded-full bg-teal-200/25 blur-3xl" />

        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
              <PencilLine size={16} />
              Profile settings
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Edit admin profile
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">
              Manage personal information, update your photo, and securely change your password.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
            <aside className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.45)] lg:sticky lg:top-6">
              <div className="h-28 bg-linear-to-r from-emerald-600 via-emerald-500 to-teal-500" />
              <div className="px-6 pb-6">
                <div className="-mt-14 flex flex-col items-center text-center">
                  <div className="rounded-full border-4 border-white bg-white shadow-xl">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt={admin.name}
                        className="h-28 w-28 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-100 text-3xl font-bold text-slate-700">
                        {initials}
                      </div>
                    )}
                  </div>

                  <h2 className="mt-4 text-xl font-semibold text-slate-900">{admin.name}</h2>
                  <p className="text-sm text-slate-500">{admin.email}</p>

                  <div className="mt-6 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Phone</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {admin.phone || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.45)] sm:p-8 lg:p-10"
            >
              <div className="grid gap-8">
                <section className="space-y-5">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Account information</h3>
                    <p className="mt-1 text-sm text-slate-500">These fields update your admin profile details.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700">Full name</span>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                        required
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700">Email address</span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                        required
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700">Phone number</span>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                        placeholder="Optional"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700">Profile photo</span>
                      <div className="flex min-h-13 items-center gap-3 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/70 px-4 py-3">
                        <UploadCloud className="shrink-0 text-emerald-600" size={20} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-emerald-700"
                        />
                      </div>
                    </label>
                  </div>
                </section>

                <section className="space-y-5 border-t border-slate-200 pt-8">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Password</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Enter your current password before setting a new one.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700">Current password</span>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 pr-12 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                          placeholder="Current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword((current) => !current)}
                          className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-emerald-600"
                          aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                        >
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700">New password</span>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 pr-12 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                          placeholder="New password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((current) => !current)}
                          className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-emerald-600"
                          aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700">Confirm new password</span>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 pr-12 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((current) => !current)}
                          className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-emerald-600"
                          aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </label>
                  </div>
                </section>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-center gap-2 text-sm text-slate-500">
                    <UserCircle2 size={16} className="text-emerald-600" />
                    Updates are saved immediately after successful validation.
                  </p>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 hover:shadow-emerald-600/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                    Save changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
