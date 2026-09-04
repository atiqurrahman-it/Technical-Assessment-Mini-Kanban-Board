import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LabelAndPlaceholderTextFormat } from "@/utils/format/textCaseFormate";
import { Controller } from "react-hook-form";
import { InputInterface } from "../interface/inputPropsType";

export const Number = ({
  form,
  name,
  labelName,
  placeholder,
  required = false,
  viewOnly = false,
  disabled = false,
  disableLabelFormatting = false,
  numberType = "integer",
  customMessage,
  onChange,
}: InputInterface["Number"]) => {
  const placeholderText = disableLabelFormatting
    ? placeholder || labelName
    : LabelAndPlaceholderTextFormat(placeholder || labelName || "");

  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          {labelName && (
            <FieldLabel htmlFor={field.name}>
              {disableLabelFormatting
                ? labelName
                : LabelAndPlaceholderTextFormat(labelName)}
              {required && <span className="text-[#ff0000]">&nbsp;*</span>}
            </FieldLabel>
          )}

          {viewOnly ? (
            <div className="py-2 px-3 text-sm text-gray-900 bg-white rounded-md border border-gray-200 min-h-10">
              {field.value ?? ""}
            </div>
          ) : (
            <Input
              id={field.name}
              type="number"
              step={numberType === "float" ? "any" : "0"}
              min={0}
              className={`focus-visible:ring-0 focus-visible:ring-offset-0
                   [&::-webkit-outer-spin-button]:appearance-none
                   [&::-webkit-inner-spin-button]:appearance-none
                   [appearance:textfield] ${
                     fieldState.invalid && "border-red-600"
                   }`}
              placeholder={placeholderText}
              value={field.value ?? ""}
              aria-invalid={fieldState.invalid}
              onWheel={(e) => e.currentTarget.blur()}
              onKeyDown={(e) => {
                const allowedKeys = [
                  "Backspace", "Delete", "Tab", "Escape", "Enter",
                  "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
                ];

                if (allowedKeys.includes(e.key)) return;
                if (e.ctrlKey || e.metaKey) return;

                if (numberType === "integer") {
                  if (!/^\d$/.test(e.key)) e.preventDefault();
                  return;
                }

                if (numberType === "float") {
                  const currentValue = (e.target as HTMLInputElement).value;
                  if (e.key === "." && !currentValue.includes(".")) return;
                  if (!/^\d$/.test(e.key)) e.preventDefault();
                }
              }}
              onChange={(e) => {
                const val = e.target.value;

                if (val === "") {
                  field.onChange("");
                  onChange?.(e);
                  return;
                }

                let numberVal: number | undefined;

                if (numberType === "float") {
                  numberVal = parseFloat(val);
                } else {
                  numberVal = parseInt(val, 10);
                }

                if (!isNaN(numberVal) && numberVal >= 0) {
                  field.onChange(numberVal);
                } else {
                  field.onChange("");
                }
                onChange?.(e);
              }}
              disabled={disabled}
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
};
