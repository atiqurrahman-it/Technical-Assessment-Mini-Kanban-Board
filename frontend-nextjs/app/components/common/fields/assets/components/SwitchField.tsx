import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { LabelAndPlaceholderTextFormat } from "@/utils/format/textCaseFormate";
import { Controller } from "react-hook-form";
import { InputInterface } from "../interface/inputPropsType";

export const SwitchField = ({
  form,
  name,
  labelName,
  description,
  border = false,
  required = false,
  disabled = false,
  viewOnly = false,
  disableLabelFormatting,
  value,
  setValue,
  onCheckedChange,
}: InputInterface["Switch"]) => {
  const LabelContent = () =>
    labelName ? (
      <div className="flex flex-col gap-1 items-start text-sm">
        <span>
          {disableLabelFormatting
            ? labelName
            : LabelAndPlaceholderTextFormat(labelName)}
          {required && <span className="text-[#ff0000]">&nbsp;*</span>}
        </span>
        {description && (
          <span className="text-xs font-light text-[#7E8C9A]">
            {description}
          </span>
        )}
      </div>
    ) : null;

  const ViewOnly = (checked?: boolean | unknown) =>
    viewOnly ? (
      <div className="text-sm font-medium text-gray-900">
        {checked ? "Yes" : "No"}
      </div>
    ) : null;

  const containerClass = `flex justify-between items-center px-3 h-11 ${
    border ? "rounded-lg border shadow-sm" : ""
  }`;

  if (form && name) {
    return (
      <Controller
        control={form.control}
        name={name}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className={containerClass}>
            <FieldLabel>
              <LabelContent />
            </FieldLabel>

            {viewOnly ? (
              ViewOnly(field.value)
            ) : (
              <>
                <Switch
                  id={field.name}
                  checked={!!field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    onCheckedChange?.(checked);
                  }}
                  disabled={disabled}
                  aria-invalid={fieldState.invalid}
                />
              </>
            )}

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    );
  }

  return (
    <div className={containerClass}>
      <LabelContent />

      {viewOnly ? (
        ViewOnly(value)
      ) : (
        <Switch
          checked={!!value}
          onCheckedChange={(checked) => setValue?.(checked)}
          disabled={disabled}
        />
      )}
    </div>
  );
};
