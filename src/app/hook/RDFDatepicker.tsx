"use client";

import * as React from "react";
import { useController } from "react-hook-form";

interface RHFDateInputProps {
  control: any;
  name: string;
  label: string;
  mandatory?: boolean;
  disabled?: boolean;
  placeholder?: string;
  label_footer?: string;
  type?: "date" | "datetime-local";
}

const RHFDateInput: React.FC<RHFDateInputProps> = ({
  control,
  name,
  label,
  mandatory = true,
  disabled = false,
  placeholder,
  label_footer,
  type = "date",
}) => {
  const {
    field: { value, onChange, onBlur },
    fieldState: { invalid, error },
  } = useController({
    name,
    control,
    defaultValue: "",
  });

  return (
    <div className="w-full space-y-1">
      {/* Label */}
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
          {mandatory && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}

      {/* Date Input */}
      <input
        id={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder || label}
        className={`h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-0 transition focus:border-primary 
          ${invalid ? "border-red-500" : ""}`}
      />

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-500">{error.message}</p>
      )}

      {/* Footer */}
      {label_footer && (
        <p className="text-xs text-muted-foreground">
          {label_footer}
        </p>
      )}
    </div>
  );
};

export default RHFDateInput;
