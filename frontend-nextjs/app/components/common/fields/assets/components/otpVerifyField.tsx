import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { LabelAndPlaceholderTextFormat } from "@/utils/format/textCaseFormate";
import { Controller } from "react-hook-form";
import { InputInterface } from "../interface/inputPropsType";

export const OTP = ({
  form,
  name,
  labelName,
  required = false,
  disableLabelFormatting = false,
  maxLength = 6,
  customMessage,
}: InputInterface["OTP"]) => {
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => {
        const value = form.watch(name) || "";
        const isSubmitted = form.formState.isSubmitted;

        const getSlotClass = (index: number) => {
          const isFilled = value.length > index;
          if (isSubmitted && fieldState.invalid) {
            return isFilled ? "border-red-500" : "border-red-500";
          }
          return isFilled ? "border-green-500" : "border-gray-300";
        };

        return (
          <Field data-invalid={fieldState.invalid}>
            {labelName && (
              <FieldLabel htmlFor={field.name}>
                {disableLabelFormatting
                  ? labelName
                  : LabelAndPlaceholderTextFormat(labelName)}
                {required && <span className="text-[#ff0000]">&nbsp;*</span>}
              </FieldLabel>
            )}

            <InputOTP maxLength={maxLength} {...field} className="w-full">
              <InputOTPGroup className="w-full flex justify-between gap-2">
                {Array.from({ length: maxLength }, (_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className={`flex-1 h-9 lg:h-12 border-2 focus-visible:ring-0 focus-visible:ring-offset-0 ${getSlotClass(
                      i,
                    )} rounded-md transition-colors duration-200 text-center`}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>

            <div className="md:flex justify-between items-center">
              {isSubmitted && fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : (
                !fieldState.invalid && customMessage && (
                  <p className="text-sm text-muted-foreground">{customMessage}</p>
                )
              )}
            </div>
          </Field>
        );
      }}
    />
  );
};
