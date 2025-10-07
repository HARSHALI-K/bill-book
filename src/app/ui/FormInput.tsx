"use client";

import { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
	label: string;
	error?: string;
};

export default function FormInput({ label, error, className, ...props }: Props) {
	return (
		<label className="grid w-full gap-1 text-sm">
			<span className="text-xs text-muted-foreground">{label}</span>
			<input
				className={`h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-0 transition focus:border-primary ${className ?? ""}`}
				{...props}
			/>
			{error ? <span className="text-[11px] text-destructive">{error}</span> : null}
		</label>
	);
} 