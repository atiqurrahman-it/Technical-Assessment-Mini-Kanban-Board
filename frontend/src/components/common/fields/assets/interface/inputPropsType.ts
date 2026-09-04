/* eslint-disable @typescript-eslint/no-explicit-any */

interface TextInputPropsInterface {
  form?: any;
  name?: string;
  placeholder?: string;
  labelName?: string;
  required?: boolean;
  disabled?: boolean;
  viewOnly?: boolean;
  disableLabelFormatting?: boolean;
  customMessage?: React.ReactNode;
  isArray?: boolean;
  leftIcon?: React.ReactNode | string;
  rightIcon?: React.ReactNode | string;
  // onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  setValue?: (value: string) => void;
}

interface TextAreaInputPropsInterface {
  form?: any;
  name?: string;
  labelName?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  viewOnly?: boolean;
  rows?: number;
  disableLabelFormatting?: boolean;
  customMessage?: React.ReactNode;
  value?: string;
  setValue?: (value: string) => void;
}

interface NumberInputPropsInterface {
  form?: any;
  name: string;
  labelName?: string;
  placeholder?: string;
  required?: boolean;
  viewOnly?: boolean;
  disabled?: boolean;
  disableLabelFormatting?: boolean;
  numberType?: "float" | "integer";
  customMessage?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface StringNumberInputPropsInterface {
  form?: any;
  name: string;
  labelName?: string;
  placeholder?: string;
  required?: boolean;
  viewOnly?: boolean;
  disabled?: boolean;
  disableLabelFormatting?: boolean;
  customMessage?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface SelectOption {
  label: string;
  value: string;
}

interface singleSelectInterface {
  form?: any;
  name?: string;
  labelName?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: (string | SelectOption)[];
  viewOnly?: boolean;
  isLoading?: boolean;
  defaultValue?: any;
  value?: string;
  setValue?: (value: string) => void;
  onValueChange?: (value: any) => void;
  disableLabelFormatting?: boolean;
  customMessage?: string;
}

interface OTPInputPropsInterface {
  form?: any;
  name: string;
  labelName?: string;
  required?: boolean;
  //disabled?: boolean;
  maxLength?: number;
  // viewOnly?: boolean;
  disableLabelFormatting?: boolean;
  customMessage?: React.ReactNode;
  // onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface PasswordInputPropsInterface {
  form?: any;
  name: string;
  labelName?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  disableLabelFormatting?: boolean;
  mode?: "normal" | "validate";
  customMessage?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showIcon?: boolean;
}
interface DatePickerFieldPropsInterface {
  form: any;
  name: string;
  labelName?: string;
  placeholder?: string;
  required?: boolean;
  isEditMode?: boolean;
  isDisabled?: boolean;
  viewOnly?: boolean;
  type?: "date" | "time" | "year" | "month" | "week";
  mode?: "previous" | "future" | "normal" | "current";
  defaultDateSelect?: boolean;
  disableLabelFormatting?: boolean;
  customMessage?: string;

  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface PhoneFieldPropsInterface {
  form: any;
  name: string;
  labelName?: string;
  defaultCountry?: string;
  disableCountryCode?: boolean;
  disableDropdown?: boolean;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  customMessage?: string;
  onValueChange?: (value: string) => void;
  isLoading?: boolean;
  viewOnly?: boolean;
  hasPhone?: boolean;
  disableLabelFormatting?: boolean;
}

interface SwitchPropsInterface {
  form?: any;
  name?: string;
  // placeholder?: string;
  labelName?: string;
  required?: boolean;
  disabled?: boolean;
  viewOnly?: boolean;
  disableLabelFormatting?: boolean;
  customMessage?: React.ReactNode;
  description?: string;
  border?: boolean;
  // onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: boolean | undefined;
  setValue?: (value: boolean) => void;
  onCheckedChange?: (checked: boolean) => void;
}

interface DocumentUploadPropsInterface {
  form: any;
  name: string;
  labelName?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  viewOnly?: boolean;
  disableLabelFormatting?: boolean;
  customMessage?: string;
  onValueChange?: (value: string | string[]) => void;
  isLoading?: boolean;
}

export interface InputInterface {
  Text: TextInputPropsInterface;
  TextArea: TextAreaInputPropsInterface;
  Number: NumberInputPropsInterface;
  StringNumber: StringNumberInputPropsInterface;
  OTP: OTPInputPropsInterface;
  Password: PasswordInputPropsInterface;
  DatePicker: DatePickerFieldPropsInterface;
  SingleSelect: singleSelectInterface;
  PhoneNumber: PhoneFieldPropsInterface;
  Switch: SwitchPropsInterface;
  DocumentUpload: DocumentUploadPropsInterface;
}

export interface FieldPropsInterface {
  form?: any;
  name: string;
  placeholder?: string;
  labelName?: string;
  description?: string;
  border?: boolean;
  options?: string[];
  required?: boolean;
  disabled?: boolean;
  isArray?: boolean;
  style?: string;
  defaultValue?: any;
  viewOnly?: boolean;
  rows?: number;
  disableLabelFormatting?: boolean;
  maxLength?: number;
  suffix?: string;
  mode?: "normal" | "validate";
  customMessage?: React.ReactNode;
  onValueChange?: (value: any) => void;
  isLoading?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface DatePickerProps {
  onChange: (value: Date | null) => void;
  value?: Date | null; // Made optional
  isEditMode?: boolean;
  mode?: "previous" | "future" | "normal" | "current";
}
