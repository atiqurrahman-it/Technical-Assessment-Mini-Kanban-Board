import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LabelAndPlaceholderTextFormat } from "@/utils/format/textCaseFormate";
import { passwordRules } from "@/utils/passoword/passwordRules";
import { EyeIcon, EyeOffIcon, Lock } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { InputInterface } from "../interface/inputPropsType";

export const Password = ({
  form,
  name,
  labelName,
  placeholder,
  required = false,
  disabled = false,
  disableLabelFormatting = false,
  mode = "normal",
  customMessage,
  onChange,
  showIcon = true,
}: InputInterface["Password"]) => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

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
          <div className="relative">
            {showIcon && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777777] z-10">
                {<Lock size={20} />}
              </div>
            )}

            <Input
              id={field.name}
              className={`py-3 w-full border rounded-md pr-10
                ${showIcon ? "pl-10" : "pl-4"}
                ${fieldState.invalid ? "border-red-600" : "border-[#e5eaf2]"}
                focus:border-[#3B9DF8]`}
              type={showPassword ? "text" : "password"}
              placeholder={placeholderText}
              {...field}
              value={passwordValue}
              aria-invalid={fieldState.invalid}
              onChange={(e) => {
                field.onChange(e);
                setPasswordValue(e.target.value);
                if (onChange) {
                  onChange(e);
                }
              }}
              disabled={disabled}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeIcon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <EyeOffIcon className="h-5 w-5 text-muted-foreground" />
              )}
            </Button>
          </div>

          {mode === "validate" &&
            passwordValue &&
            !passwordRules.every((rule) => rule.test(passwordValue)) && (
              <ul className="mt-2 space-y-1 text-sm">
                {passwordRules.map((rule, index) => {
                  const passed = rule.test(passwordValue);
                  return (
                    <li
                      key={index}
                      className={`flex items-center gap-2 ${
                        passed ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full inline-block ${
                          passed ? "bg-green-600" : "bg-gray-400"
                        }`}
                      />
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
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
