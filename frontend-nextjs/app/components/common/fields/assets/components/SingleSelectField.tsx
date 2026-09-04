/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LabelAndPlaceholderTextFormat } from "@/utils/format/textCaseFormate";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { InputInterface } from "../interface/inputPropsType";

export const SingleSelectField = ({
  form,
  name,
  labelName,
  placeholder,
  required = false,
  disabled = false,
  options,
  viewOnly = false,
  onValueChange,
  isLoading = false,
  defaultValue = "",
  value: controlledValue,
  setValue: controlledSetValue,
  customMessage,
  disableLabelFormatting = false,
}: InputInterface["SingleSelect"]) => {
  // Use controlled value if provided, otherwise fall back to local state
  const isControlled = controlledValue !== undefined;
  const [localValue, setLocalValue] = useState(defaultValue);
  const currentValue = isControlled ? controlledValue : localValue;
  const handleChange = isControlled
    ? (controlledSetValue || onValueChange || setLocalValue)
    : setLocalValue;

  // ── Normalize options to { label, value } format ──
  const normalizedOptions = (options || []).map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt,
  );

  const placeholderText = disableLabelFormatting
    ? placeholder || "Select an option"
    : LabelAndPlaceholderTextFormat(`${placeholder || "Select an option"}`);

  const renderSelect = (
    value: string,
    onChange: (val: string) => void,
  ) => {
    return (
      <Select
        onValueChange={(val) => {
          onChange(val);
          if (onValueChange) onValueChange(val);
        }}
        value={value}
        disabled={disabled}
      >
        <SelectTrigger
          className={`focus-visible:ring-0 w-full focus-visible:ring-offset-0`}
        >
          <SelectValue placeholder={placeholderText} />
        </SelectTrigger>
        <SelectContent className="capitalize">
          {isLoading ? (
            <SelectItem key="loading" value="loading" disabled>
              Loading...
            </SelectItem>
          ) : normalizedOptions.length > 0 ? (
            normalizedOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="capitalize">
                {option.label}
              </SelectItem>
            ))
          ) : (
            <SelectItem key="no-options" value="no-options" disabled>
              {disableLabelFormatting
                ? labelName
                : LabelAndPlaceholderTextFormat(labelName || "")}{" "}
              options not available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    );
  };

  if (form && name) {
    return (
      <Controller
        control={form.control}
        name={name as any}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            {labelName && (
              <FieldLabel htmlFor={field.name}>
                {disableLabelFormatting
                  ? labelName
                  : LabelAndPlaceholderTextFormat(labelName)}
                {required && <span className="text-[#7E8C9A]">&nbsp;*</span>}
              </FieldLabel>
            )}

            {viewOnly ? (
              <div className="py-2 px-3 text-sm text-gray-900 capitalize bg-white rounded-md border border-gray-200 min-h-10">
                {field.value || ""}
              </div>
            ) : (
              renderSelect(field.value, field.onChange)
            )}

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            {!fieldState.invalid && customMessage && (
              <p className="text-sm text-muted-foreground">{customMessage}</p>
            )}
          </Field>
        )}
      />
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {labelName && (
        <label className="font-semibold capitalize text-[14px] leading-6 tracking-[0.02em]">
          {disableLabelFormatting
            ? labelName
            : LabelAndPlaceholderTextFormat(labelName)}
          {required && <span className="text-[#7E8C9A]">&nbsp;*</span>}
        </label>
      )}

      {viewOnly ? (
        <div className="py-2 px-3 text-sm text-gray-900 capitalize! bg-white rounded-md border border-gray-200 min-h-10">
          {currentValue || ""}
        </div>
      ) : (
        renderSelect(currentValue, handleChange)
      )}
    </div>
  );
};
