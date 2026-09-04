/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LabelAndPlaceholderTextFormat } from "@/utils/format/textCaseFormate";
import { Controller } from "react-hook-form";
import { InputInterface } from "../interface/inputPropsType";

export const Text = ({
  form,
  name,
  placeholder,
  labelName,
  required = false,
  disabled = false,
  viewOnly = false,
  disableLabelFormatting = false,
  customMessage,
  isArray = false,
  leftIcon,
  rightIcon,
  value,
  setValue,
}: InputInterface["Text"]) => {
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
      <div className="py-2 px-3 text-sm text-gray-900 bg-white rounded-md border border-gray-200 min-h-10">
        {text || ""}
      </div>
    ) : null;

  const RightIcon = () =>
    rightIcon ? (
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[1rem] dark:text-slate-400 text-[#777777] cursor-pointer">
        {rightIcon}
      </div>
    ) : null;

  const LeftIcon = () =>
    leftIcon ? (
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[1rem] dark:text-slate-400 text-[#777777]">
        {leftIcon}
      </div>
    ) : null;

  return (
    <>
      {form ? (
        <Controller
          control={form.control}
          name={name || "text"}
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
                <div className="w-full relative">
                  <LeftIcon />
                  <Input
                    id={field.name}
                    className={`peer focus-visible:ring-0 focus-visible:ring-offset-0 border-[#e5eaf2] dark:bg-slate-900 dark:placeholder:text-slate-500 dark:text-[#abc2d3] dark:border-slate-600 border rounded-md outline-none ${rightIcon ? "pr-10" : "pr-4"} ${leftIcon ? "pl-10" : "pl-4"} py-3 w-full focus:border-[#3B9DF8] transition-colors duration-300 ${
                      fieldState.invalid && "border-red-600"
                    }`}
                    suppressHydrationWarning
                    placeholder={placeholderText}
                    disabled={disabled}
                    {...field}
                    type="text"
                    aria-invalid={fieldState.invalid}
                    onChange={(event) => {
                      const inputValue = event.target.value;
                      if (isArray) {
                        const arr = inputValue
                          .split(/[\s,]+/)
                          .map((v) => v.trim())
                          .filter((v) => v.length > 0);
                        form.setValue(name, arr as any, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }
                      field.onChange(event);
                    }}
                  />
                  <RightIcon />
                </div>
              )}
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              {!fieldState.invalid && customMessage && (
                <p className="text-sm text-muted-foreground">{customMessage}</p>
              )}
            </Field>
          )}
        />
      ) : (
        <>
          {labelName && <LabelContent />}
          <div className="w-full relative">
            <LeftIcon />
            <Input
              className={`peer focus-visible:ring-0 focus-visible:ring-offset-0 border-[#e5eaf2] dark:bg-slate-900 dark:placeholder:text-slate-500 dark:text-[#abc2d3] dark:border-slate-600 border rounded-md outline-none ${rightIcon ? "pr-10" : "pr-4"} ${leftIcon ? "pl-10" : "pl-4"} py-3 w-full focus:border-[#3B9DF8] transition-colors duration-300 `}
              value={value}
              onChange={(e) => setValue?.(e.target.value || "")}
              type="text"
              placeholder="Email"
            />
            <RightIcon />
          </div>
        </>
      )}
    </>
  );
};
