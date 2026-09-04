/* eslint-disable @typescript-eslint/no-explicit-any */

import { Textarea } from "@/components/ui/custom/textarea";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { LabelAndPlaceholderTextFormat } from "@/utils/format/textCaseFormate";
import { Controller } from "react-hook-form";
import { InputInterface } from "../interface/inputPropsType";

export const TextArea = ({
  form,
  name,
  labelName,
  placeholder,
  required = false,
  disabled = false,
  viewOnly = false,
  rows = 10,
  disableLabelFormatting = false,
  customMessage,
  value,
  setValue,
}: InputInterface["TextArea"]) => {
  const placeholderText = disableLabelFormatting
    ? placeholder || labelName
    : LabelAndPlaceholderTextFormat(placeholder || labelName || "");

  const LabelContent = () =>
    labelName ? (
      <>
        {disableLabelFormatting
          ? labelName
          : LabelAndPlaceholderTextFormat(labelName)}
        {required && <span className="text-[#ff0000]">&nbsp;*</span>}
      </>
    ) : null;

  const ViewOnly = (text: string) =>
    viewOnly ? (
      <div className="py-2 px-3 text-sm text-gray-900 whitespace-pre-wrap break-words bg-white rounded-md border border-gray-200 min-h-32">
        {text || ""}
      </div>
    ) : null;

  if (form && name) {
    return (
      <Controller
        control={form.control}
        name={name}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            {labelName && (
              <FieldLabel htmlFor={field.name}>
                <LabelContent />
              </FieldLabel>
            )}

            {viewOnly ? (
              ViewOnly(field.value)
            ) : (
              <Textarea
                id={field.name}
                {...field}
                rows={rows}
                disabled={disabled}
                suppressHydrationWarning
                placeholder={placeholderText}
                aria-invalid={fieldState.invalid}
                className={`resize-none focus-visible:ring-0 focus-visible:ring-offset-0 border rounded-md transition-colors duration-300 ${
                  fieldState.invalid
                    ? "border-red-600"
                    : "border-[#e5eaf2] focus:border-[#3B9DF8]"
                }`}
              />
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
    <>
      {labelName && <LabelContent />}

      {viewOnly ? (
        ViewOnly(value || "")
      ) : (
        <>
          <Textarea
            rows={rows}
            value={value}
            disabled={disabled}
            placeholder={placeholderText}
            onChange={(e: any) => setValue?.(e.target.value)}
            className="resize-none focus-visible:ring-0 focus-visible:ring-offset-0 border border-[#e5eaf2] rounded-md focus:border-[#3B9DF8]"
          />
        </>
      )}
    </>
  );
};
