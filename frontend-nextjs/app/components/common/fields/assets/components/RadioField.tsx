import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Controller } from "react-hook-form";
import { FieldPropsInterface } from "../interface/inputPropsType";

interface RadioFieldProps extends FieldPropsInterface {
  direction?: "row" | "column";
}

export const RadioField = ({
  form,
  name,
  labelName,
  options,
  required = false,
  disabled = false,
  viewOnly = false,
  direction = "column",
}: RadioFieldProps) => {
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="space-y-3">
          {labelName && (
            <FieldLabel htmlFor={field.name}>
              {labelName}
              {required && <span className="text-[#ff0000]"> *</span>}
            </FieldLabel>
          )}

          <RadioGroup
            onValueChange={field.onChange}
            value={field.value}
            disabled={disabled || viewOnly}
            className={
              direction === "row" ? "flex gap-6" : "flex flex-col space-y-3"
            }
          >
            {options?.map((option, i) => (
              <div key={i} className="flex items-center space-x-3">
                <RadioGroupItem value={option} id={`${field.name}-${i}`} />
                <FieldLabel htmlFor={`${field.name}-${i}`} className="font-normal text-slate-600">
                  {option}
                </FieldLabel>
              </div>
            ))}
          </RadioGroup>

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};
