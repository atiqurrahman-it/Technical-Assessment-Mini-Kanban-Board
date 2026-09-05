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
        {required && <span className="text-destructive">&nbsp;*</span>}
      </>
    ) : null;

  const ViewOnly = (text: string) =>
    viewOnly ? (
      <div className="py-2 px-3 text-sm text-foreground bg-muted rounded-md border border-border min-h-10">
        {text || ""}
      </div>
    ) : null;

  const RightIcon = () =>
    rightIcon ? (
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[1rem] text-muted-foreground cursor-pointer">
        {rightIcon}
      </div>
    ) : null;

  const LeftIcon = () =>
    leftIcon ? (
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[1rem] text-muted-foreground">
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
                    className={`peer focus-visible:ring-0 focus-visible:ring-offset-0 rounded-md outline-none ${rightIcon ? "pr-10" : "pr-4"} ${leftIcon ? "pl-10" : "pl-4"} py-3 w-full transition-colors duration-300`}
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
              className={`peer focus-visible:ring-0 focus-visible:ring-offset-0 rounded-md outline-none ${rightIcon ? "pr-10" : "pr-4"} ${leftIcon ? "pl-10" : "pl-4"} py-3 w-full transition-colors duration-300`}
              value={value}
              onChange={(e) => setValue?.(e.target.value || "")}
              type="text"
              placeholder={placeholderText}
            />
            <RightIcon />
          </div>
        </>
      )}
    </>
  );
};
