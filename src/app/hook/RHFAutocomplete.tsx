"use client";

import * as React from "react";
import { useRef, useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as CommandPrimitive from "cmdk";
import { cn } from "@/lib/utils"; // Tailwind class merge helper

type Option = { label: string; value: string };

interface RHFAutoCompleteProps {
  control: any;
  name: string;
  options: Option[];
  placeholder?: string;
  loading?: boolean;
  multiple?: boolean;
  onScrollToEnd?: () => void;
  onChange?: (event: any, value: any) => void;
}

export default function RHFAutoComplete({
  control,
  name,
  options,
  placeholder = "Select...",
  loading = false,
  multiple = false,
  onScrollToEnd,
  onChange: customOnChange,
}: RHFAutoCompleteProps) {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={multiple ? [] : ""}
      render={({ field, fieldState: { error } }) => {
        const triggerRef = useRef<HTMLButtonElement>(null);
        const [triggerWidth, setTriggerWidth] = useState<number>(0);

        // Ensure dropdown width matches button width
        useEffect(() => {
          if (triggerRef.current) {
            setTriggerWidth(triggerRef.current.offsetWidth);
          }
          const handleResize = () => {
            if (triggerRef.current) setTriggerWidth(triggerRef.current.offsetWidth);
          };
          window.addEventListener("resize", handleResize);
          return () => window.removeEventListener("resize", handleResize);
        }, []);

        const selectedValues = multiple
          ? options.filter((o) => Array.isArray(field.value) && field.value.includes(o.value))
          : options.find((o) => o.value === field.value);

        const handleChange = (val: string) => {
          if (multiple) {
            let newValues = Array.isArray(field.value) ? [...field.value] : [];
            if (newValues.includes(val)) {
              newValues = newValues.filter((v) => v !== val);
            } else {
              newValues.push(val);
            }
            field.onChange(newValues);
            customOnChange?.(null, newValues);
          } else {
            field.onChange(val);
            customOnChange?.(null, val);
          }
        };

        return (
          <div className="w-full">
            <PopoverPrimitive.Root>
              <PopoverPrimitive.Trigger asChild>
                <button
                  ref={triggerRef}
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-start rounded-md border px-3 py-2 text-sm",
                    error ? "border-red-500" : "border-input"
                  )}
                >
                  <span className="truncate">
                    {multiple
                      ? selectedValues.length > 0
                        ? selectedValues.map((s) => s.label).join(", ")
                        : placeholder
                      : selectedValues?.label || placeholder}
                  </span>
                  {loading ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                  )}
                </button>
              </PopoverPrimitive.Trigger>

              <PopoverPrimitive.Content
                align="start"
                side="bottom"
                sideOffset={4}
 className="p-0 z-[9999]"                 style={{ minWidth: triggerWidth }} // full width dropdown
              >
                <CommandPrimitive.Command className="bg-white rounded-md shadow-md">
                  <div className="p-2">
                    <CommandPrimitive.CommandInput
                      className="w-full border-b border-gray-200 p-1 outline-none"
                      placeholder={`Search ${placeholder}`}
                    />
                  </div>
                  <CommandPrimitive.CommandEmpty className="p-2 text-gray-500">
                    No results found.
                  </CommandPrimitive.CommandEmpty>
                  <CommandPrimitive.CommandGroup
                    onScroll={(e) => {
                      const target = e.currentTarget;
                      if (target.scrollHeight - target.scrollTop === target.clientHeight) {
                        onScrollToEnd?.();
                      }
                    }}
                  >
                    {options.map((opt) => {
                      const selected = multiple
                        ? Array.isArray(field.value) && field.value.includes(opt.value)
                        : field.value === opt.value;
                      return (
                        <CommandPrimitive.CommandItem
                          key={opt.value}
                          onSelect={() => handleChange(opt.value)}
                          className="flex items-center justify-start px-2 py-1 cursor-pointer hover:bg-gray-100"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selected ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {opt.label}
                        </CommandPrimitive.CommandItem>
                      );
                    })}
                  </CommandPrimitive.CommandGroup>
                </CommandPrimitive.Command>
              </PopoverPrimitive.Content>
            </PopoverPrimitive.Root>

            {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
          </div>
        );
      }}
    />
  );
}
