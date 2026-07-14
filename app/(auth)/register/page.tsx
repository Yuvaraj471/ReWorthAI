"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useToastStore } from "@/store/useToastStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Leaf, User, Mail, Lock, BookOpen, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const registerSchema = zod
  .object({
    name: zod.string().min(2, "Name must be at least 2 characters"),
    registerNumber: zod.string().min(4, "Invalid register number format"),
    department: zod.string().min(1, "Please select a department"),
    year: zod.string().min(1, "Please select your year level"),
    email: zod.string().email("Invalid email address"),
    password: zod.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: zod.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = zod.infer<typeof registerSchema>;

export default function StudentRegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuthStore();
  const { addToast } = useToastStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const success = await registerUser({
        name: data.name,
        registerNumber: data.registerNumber,
        department: data.department,
        year: data.year,
        email: data.email,
        password: data.password,
        confirm_password: data.confirmPassword,
      });

      if (success) {
        addToast("Registration complete! Please login with your details.", "success");
        router.push("/login");
      } else {
        addToast("Registration failed. Please check details and try again.", "error");
      }
    } catch (err) {
      addToast("An error occurred during registration.", "error");
    }
  };

  const departments = [
    "Information Technology",
    "Artificial Intelligence and Data Science",
    "Artificial Intelligence and Machine Learning",
    "Computer Science and Engineering",
    "Computer Science and Business Systems",
    "Electronics and Communication Engineering",
    "Electrical and Electronics Engineering",
    "Biomedical Engineering",
    "Computer Science and Engineering (Cyber Security)",
  ];

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6 py-12 relative overflow-hidden">
      {/* Background soft glowing blur spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full glass-card p-8 rounded-2xl border border-border relative z-10"
      >
        {/* Brand header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-lime-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-lime-500 bg-clip-text text-transparent">
            ReWorth AI
          </h1>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-lg font-bold">Create Wallet Account</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Register your student credential and join the green transition.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Alex Rivera"
                  {...register("name")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
              {errors.name && (
                <p className="text-[10px] font-semibold text-rose-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Campus Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="alex.r@reworth.ai"
                  {...register("email")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
              {errors.email && (
                <p className="text-[10px] font-semibold text-rose-500">{errors.email.message}</p>
              )}
            </div>

            {/* Register Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Register Number</label>
              <div className="relative">
                <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="2024CS1082"
                  {...register("registerNumber")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
              {errors.registerNumber && (
                <p className="text-[10px] font-semibold text-rose-500">{errors.registerNumber.message}</p>
              )}
            </div>

            {/* Year Level */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Year Level</label>
              <select
                {...register("year")}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm appearance-none cursor-pointer"
              >
                <option value="">Select Year</option>
                {years.map((y) => (
                  <option key={y} value={y} className="bg-background text-foreground">
                    {y}
                  </option>
                ))}
              </select>
              {errors.year && (
                <p className="text-[10px] font-semibold text-rose-500">{errors.year.message}</p>
              )}
            </div>
          </div>

          {/* Academic Department */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Academic Department</label>
            <select
              {...register("department")}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm appearance-none cursor-pointer"
            >
              <option value="">Select Academic Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept} className="bg-background text-foreground">
                  {dept}
                </option>
              ))}
            </select>
            {errors.department && (
              <p className="text-[10px] font-semibold text-rose-500">{errors.department.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
              {errors.password && (
                <p className="text-[10px] font-semibold text-rose-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-[10px] font-semibold text-rose-500">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 py-3 bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-white font-bold rounded-xl text-xs shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering Account...
              </>
            ) : (
              "Submit Registration"
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-border/80 pt-6 text-center text-xs">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-emerald-500 hover:text-emerald-400 transition-all">
              Sign In Here
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
