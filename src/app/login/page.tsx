"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "../lib/api";
import { saveAuthToken } from "../lib/auth";
import RHFInput from "../hook/RHFInput";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";

 type LoginFormValues = {
	email: string;
	password: string;
 };

export default function LoginPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	const schema: yup.ObjectSchema<LoginFormValues> = yup.object({
		email: yup
			.string()
			.required("Email is required")
			.email("Enter a valid email"),
		password: yup
			.string()
			.required("Password is required")
			.min(6, "Password must be at least 6 characters"),
	}).required();

	const { control, handleSubmit, setError, reset } = useForm<LoginFormValues>({
		resolver: yupResolver(schema),
		defaultValues: { email: "", password: "" },
	});

	const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
  setFormError(null);
  setLoading(true);

  try {
    const res = await apiFetch<any>(
      "POST",
      "/common/login",
      { login_type: "email", email: data.email, password: data.password }
    );

    const token = res?.data?.token || res?.token || res?.access_token;
    const userData = res?.data?.userData || res?.userData || null;
    if (!token) throw new Error("Token missing in response");

    saveAuthToken(token);
    if (userData) localStorage.setItem("userData", JSON.stringify(userData));

    router.push("/dashboard");
    toast.success("Logged in successfully");
    reset();
  } catch (err: any) {
    const status = err?.status;
    const dataErr = err?.data;
    const emailMsg = dataErr?.data?.email?.[0] || dataErr?.errors?.email?.[0] || null;
    const passwordMsg = dataErr?.data?.password?.[0] || dataErr?.errors?.password?.[0] || null;
    const msg = emailMsg || passwordMsg || err?.message || "Login failed";

    if (emailMsg) {
      setError("email", { type: "server", message: emailMsg });
      setFormError(null);
    } else if (passwordMsg) {
      setError("password", { type: "server", message: passwordMsg });
      setFormError(null);
    } else {
      setFormError(msg);
    }
    toast.error(status ? `${status}: ${msg}` : msg);
  } finally {
    setLoading(false);
  }
};


	return (
		<main className=" card grid min-h-dvh place-items-center px-4 py-10">
			<div className="w-full max-w-[420px] rounded-2xl border border-border bg-card p-6 shadow">
				<div className="mb-4 text-center">
					<h1 className="text-base font-semibold">Welcome <span className="text-primary font-bold">Bill Book</span></h1>
					<p className="text-xs text-muted-foreground">Sign in to continue</p>
				</div>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<RHFInput
						control={control}
						name="email"
						label="Email"
						placeholder="you@example.com"
					/>

					<RHFInput
						control={control}
						name="password"
						label="Password"
						placeholder="••••••••"
						inputType="password"
					/>

					{formError ? <p className="text-[12px] text-destructive">{formError}</p> : null}
					<button disabled={loading} type="submit" className="h-11 w-full rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-60">
						{loading ? "Logging in..." : "Login"}
					</button>
				</form>
			</div>
		</main>
	);
} 