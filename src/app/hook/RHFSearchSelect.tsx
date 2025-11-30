"use client";

import * as React from "react";
import { useController } from "react-hook-form";
import { Search, Plus } from "lucide-react";

interface Option {
  label: string;
  value: string | number;
}

interface RHFSearchSelectProps {
  control: any;
  name: string;
  label?: string;
  options?: Option[];
  placeholder?: string;
  mandatory?: boolean;
  disabled?: boolean;
  onSearch?: (query: string) => void;
  onAddClick?: () => void;
  onValueChange?: (val: string | number) => void;
  addButtonLabel?: string;
}

const RHFSearchSelect: React.FC<RHFSearchSelectProps> = ({
  control,
  name,
  label,
  options = [],
  placeholder = "",
  mandatory = true,
  disabled = false,
  onSearch,
  onAddClick,
  onValueChange,
  addButtonLabel = "Add",
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const {
    field: { value, onChange },
    fieldState: { invalid, error },
  } = useController({ name, control, defaultValue: "" });

  const filteredOptions = options.filter((opt) =>
    String(opt.label).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 🔹 Close dropdown if clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔹 Close on ESC key
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (onSearch) onSearch(query);
  };

  const handleSelect = (optValue: string | number) => {
    onChange(optValue);
    onValueChange?.(optValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="w-full space-y-1 relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {mandatory && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* 🔹 Main Input */}
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={
            value && !searchQuery ? "" : placeholder || `Search ${label || name}`
          }
          disabled={disabled}
          className={`h-11 w-full rounded-lg border bg-background px-3 pl-9 text-sm outline-none transition 
            ${invalid ? "border-red-500" : "border-input focus:border-primary"}`}
        />

        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />

        {/* 🔹 Show selected label instead of value */}
        {value && !searchQuery && (
          <div className="absolute inset-0 px-3 pl-9 flex items-center pointer-events-none text-sm text-gray-800">
            {options.find((o) => String(o.value) === String(value))?.label}
          </div>
        )}

        {/* 🔥 FIXED DROPDOWN: clicking outside closes, overlay works correctly */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-input rounded-lg shadow-lg 
                   z-[99999] max-h-64 overflow-y-auto"
          >
            {/* Add Button */}
            {onAddClick && (
              <button
                type="button"
                onClick={() => {
                  onAddClick();
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-sm flex items-center gap-2 text-primary hover:bg-accent border-b"
              >
                <Plus className="h-4 w-4" /> {addButtonLabel}
              </button>
            )}

            {/* Options */}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-accent
                    ${
                      String(value) === String(opt.value)
                        ? "bg-primary/10 font-medium"
                        : ""
                    }`}
                >
                  {opt.label}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                No results found
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
};

export default RHFSearchSelect;
