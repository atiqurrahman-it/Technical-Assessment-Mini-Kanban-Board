import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

import { Checkbox } from "@/components/ui/checkbox";
import { Controller } from "react-hook-form";
import { FieldPropsInterface } from "../interface/inputPropsType";

interface MultiCheckFieldProps extends Omit<FieldPropsInterface, "options"> {
  options?: { label: string; value?: string; id?: string }[];
}

export const MultiCheckField = ({
  form,
  name,
  labelName,
  options = [],
  required = false,
  viewOnly = false,
  style,
}: MultiCheckFieldProps) => {
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => {
        const getOptionIdentifier = (option: {
          value?: string;
          id?: string;
        }) => {
          return option.value || option.id;
        };

        const isOptionChecked = (option: { value?: string; id?: string }) => {
          const identifier = getOptionIdentifier(option);
          if (!identifier) return false;
          return (field?.value || []).includes(identifier);
        };

        const handleCheckedChange = (
          option: { value?: string; id?: string },
          checked: boolean,
        ) => {
          const identifier = getOptionIdentifier(option);
          if (!identifier) return;

          const currentValues = field.value || [];
          const newValues = checked
            ? [...currentValues, identifier]
            : currentValues.filter((val: string) => val !== identifier);

          field.onChange(newValues);
        };

        return (
          <Field data-invalid={fieldState.invalid}>
            {labelName && (
              <FieldLabel className="text-sm font-semibold">
                {labelName}
                {required && <span className="text-[#ff0000]"> *</span>}
              </FieldLabel>
            )}

            <div className={style?.length ? style : "flex flex-col mt-2 gap-3"}>
              {options?.map((option) => {
                const identifier = getOptionIdentifier(option);
                return (
                  <div key={identifier} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${field.name}-${identifier}`}
                      checked={isOptionChecked(option)}
                      onCheckedChange={(checked) =>
                        handleCheckedChange(option, checked === true)
                      }
                      disabled={viewOnly}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldLabel htmlFor={`${field.name}-${identifier}`} className="text-sm cursor-pointer">
                      {option?.label}
                    </FieldLabel>
                  </div>
                );
              })}
            </div>

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
};
