"use client";

import React from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useToastStore } from "@/store/useToastStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { User, Lock, ShieldAlert } from "lucide-react";
import api from "@/lib/api";

// Schemas for form validation
const profileSchema = zod.object({
  name: zod.string().min(2, "Name must be at least 2 characters"),
  email: zod.string().email("Invalid email address"),
  registerNumber: zod.string().min(4, "Invalid register number format"),
  department: zod.string().min(1, "Please select a department"),
  year: zod.string().min(1, "Please select your year level"),
});

const passwordSchema = zod
  .object({
    currentPassword: zod.string().min(6, "Current password must be at least 6 characters"),
    newPassword: zod.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: zod.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileFormValues = zod.infer<typeof profileSchema>;
type PasswordFormValues = zod.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, updateProfile, useBackend, token, loadCurrentUser } = useAuthStore();
  const { addToast } = useToastStore();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      registerNumber: user?.registerNumber || "",
      department: user?.department || "",
      year: user?.year || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  if (!user) return null;

  const onProfileSubmit = async (data: ProfileFormValues) => {
    // Always update local state for immediate UI feedback
    updateProfile(data);

    // Persist to backend if connected
    if (useBackend && token && !token.startsWith("mock-")) {
      try {
        await api.put("/api/v1/auth/me", { name: data.name, email: data.email });
        await loadCurrentUser(); // Refresh from backend
        addToast("Profile synced to backend!", "success");
      } catch (err) {
        addToast("Profile saved locally. Backend sync failed.", "warning");
      }
    } else {
      addToast("Profile details updated successfully!", "success");
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    if (useBackend && token && !token.startsWith("mock-")) {
      try {
        await api.post("/api/v1/auth/me/change-password", {
          current_password: data.currentPassword,
          new_password: data.newPassword,
        });
        resetPasswordForm();
        addToast("Password changed successfully!", "success");
      } catch (err: unknown) {
        const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
        addToast(detail || "Failed to change password. Check current password.", "error");
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 800));
      resetPasswordForm();
      addToast("Password changed successfully!", "success");
    }
  };

  const departments = [
    "Computer Science",
    "Information Technology",
    "Electrical & Electronics",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Biotechnology",
    "Artificial Intelligence and Data Science",
    "Artificial Intelligence and Machine Learning",
  ];

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      {/* Title Header */}
      <div className="border-b border-border/60 pb-6">
        <h2 className="text-3xl font-bold tracking-tight">My Profile Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your personal details, campus affiliations, and account security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: Avatar and stats info */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-2xl text-center relative overflow-hidden">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500/10 to-lime-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-3xl text-emerald-500 mx-auto mb-4">
              {user.name.charAt(0)}
            </div>
            <h3 className="font-bold text-lg">{user.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{user.registerNumber}</p>
            <span className="inline-block text-[10px] bg-emerald-500/10 text-emerald-500 font-bold px-3 py-1 rounded-full mt-3 uppercase tracking-wider">
              {user.department}
            </span>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
              Sustainability Impact
            </h4>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-black/10 dark:bg-white/5 border border-border/60 rounded-xl">
                <span className="block text-xl font-bold text-emerald-500">{user.bottlesRecycled}</span>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase">Units Recycled</span>
              </div>
              <div className="p-3 bg-black/10 dark:bg-white/5 border border-border/60 rounded-xl">
                <span className="block text-xl font-bold text-cyan-400">{user.carbonSaved}kg</span>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase">CO2 Avoided</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Account Forms */}
        <div className="md:col-span-2 space-y-8">
          {/* Profile Edit Form */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="font-bold text-md mb-6 flex items-center gap-2 border-b border-border/60 pb-3">
              <User className="w-5 h-5 text-emerald-500" />
              Personal Affiliation Details
            </h3>

            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                  <input
                    type="text"
                    {...registerProfile("name")}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                  />
                  {profileErrors.name && (
                    <p className="text-[10px] font-semibold text-rose-500">{profileErrors.name.message}</p>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                  <input
                    type="email"
                    {...registerProfile("email")}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                  />
                  {profileErrors.email && (
                    <p className="text-[10px] font-semibold text-rose-500">{profileErrors.email.message}</p>
                  )}
                </div>

                {/* Register Number */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Register Number</label>
                  <input
                    type="text"
                    {...registerProfile("registerNumber")}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                  />
                  {profileErrors.registerNumber && (
                    <p className="text-[10px] font-semibold text-rose-500">
                      {profileErrors.registerNumber.message}
                    </p>
                  )}
                </div>

                {/* Year Level */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Year Level</label>
                  <select
                    {...registerProfile("year")}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm appearance-none cursor-pointer"
                  >
                    {years.map((y) => (
                      <option key={y} value={y} className="bg-background text-foreground">
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Academic Department</label>
                <select
                  {...registerProfile("department")}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm appearance-none cursor-pointer"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept} className="bg-background text-foreground">
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isProfileSubmitting}
                className="mt-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-white font-bold rounded-xl text-xs shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                {isProfileSubmitting ? "Saving..." : "Update Profile Details"}
              </button>
            </form>
          </div>

          {/* Password Reset Form */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="font-bold text-md mb-6 flex items-center gap-2 border-b border-border/60 pb-3">
              <Lock className="w-5 h-5 text-emerald-500" />
              Change Password
            </h3>

            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...registerPassword("currentPassword")}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                />
                {passwordErrors.currentPassword && (
                  <p className="text-[10px] font-semibold text-rose-500">
                    {passwordErrors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* New Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...registerPassword("newPassword")}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-[10px] font-semibold text-rose-500">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...registerPassword("confirmPassword")}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-[10px] font-semibold text-rose-500">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isPasswordSubmitting}
                className="mt-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-white font-bold rounded-xl text-xs shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                {isPasswordSubmitting ? "Changing..." : "Change Account Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
