import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LabelAndPlaceholderTextFormat } from "@/utils/format/textCaseFormate";
import { Controller } from "react-hook-form";
import { InputInterface } from "../interface/inputPropsType";

export const StringNumber = ({
  form,
  name,
  labelName,
  placeholder,
  required = false,
  viewOnly = false,
  disabled = false,
  disableLabelFormatting = false,
  customMessage,
  onChange,
}: InputInterface["StringNumber"]) => {
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
              {field.value || ""}
            </div>
          ) : (
            <Input
              id={field.name}
              className={`focus-visible:ring-0 focus-visible:ring-offset-0 ${
                fieldState.invalid && "border-red-600"
              }`}
              placeholder={placeholderText}
              disabled={disabled}
              type="text"
              aria-invalid={fieldState.invalid}
              value={field.value ?? ""}
              onChange={(event) => {
                const inputValue = event.target.value;

                if (inputValue === "") {
                  form.setValue(name, "");
                  field.onChange(event);
                  return;
                }

                if (!/^\d+$/.test(inputValue)) {
                  form.setError(name, {
                    type: "manual",
                    message: "Please type number",
                  });
                } else {
                  form.clearErrors(name);
                  form.setValue(name, inputValue, {
                    shouldValidate: true,
                  });
                }

                field.onChange(event);

                if (onChange) {
                  onChange(event);
                }
              }}
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
