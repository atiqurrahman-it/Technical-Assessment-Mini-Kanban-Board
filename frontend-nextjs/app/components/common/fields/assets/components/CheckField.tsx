import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Controller } from "react-hook-form";
import { FieldPropsInterface } from "../interface/inputPropsType";

export const CheckField = ({
  form,
  name,
  labelName,
  required = false,
  disabled = false,
  viewOnly = false,
}: FieldPropsInterface) => {
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} orientation="horizontal" className="items-center">
          <Checkbox
            id={field.name}
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={disabled || viewOnly}
            aria-invalid={fieldState.invalid}
          />
          {labelName && (
            <FieldLabel htmlFor={field.name} className="flex-1 text-sm font-medium leading-none">
              {labelName}
              {required && <span className="text-[#ff0000]"> *</span>}
            </FieldLabel>
          )}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};
