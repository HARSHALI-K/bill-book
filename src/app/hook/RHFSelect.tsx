"use client"

import * as React from "react"
import { useController } from "react-hook-form"

interface Option {
  label: string
  value: string | number
}

interface RHFSelectProps {
  control: any
  name: string
  label?: string
  options?: Option[]
  placeholder?: string
  mandatory?: boolean
  disabled?: boolean
  onValueChange?: (val: string | number) => void
}

const RHFSelect: React.FC<RHFSelectProps> = ({
  control,
  name,
  label,
  options = [],
  placeholder = "",
  mandatory = true,
  disabled = false,
  onValueChange,
}) => {
  const {
    field: { value, onChange },
    fieldState: { invalid, error },
  } = useController({ name, control, defaultValue: "" })

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
          {mandatory && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}

      <select
        id={name}
        value={value}
        onChange={(e) => {
          const v = e.target.value
          onChange(v)
          if (typeof onValueChange === "function") onValueChange(v)
        }}
        disabled={disabled}
        className={`h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-0 transition focus:border-primary ${invalid ? "border-red-500" : ""}`}
      >
        <option value="">{placeholder || `Select ${label || name}`}</option>
        {options.map((opt) => (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  )
}

export default RHFSelect
