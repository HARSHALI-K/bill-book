"use client";

import { SelectHTMLAttributes } from "react";

type Option = { label: string; value: string };

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
	label: string;
	options: Option[];
	placeholder?: string;
	error?: string;
};

export default function FormSelect({ label, options, placeholder, error, className, ...props }: Props) {
	return (
		<label className="grid w-full gap-1 text-sm">
			<span className="text-xs text-muted-foreground">{label}</span>
			<select
				className={`h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-0 transition focus:border-primary ${className ?? ""}`}
				{...props}
			>
				{placeholder ? (
					<option value="" disabled selected hidden>
						{placeholder}
					</option>
				) : null}
				{options.map((opt) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>
			{error ? <span className="text-[11px] text-destructive">{error}</span> : null}
		</label>
	);
} 