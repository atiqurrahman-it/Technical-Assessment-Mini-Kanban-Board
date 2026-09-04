import { Number } from "./assets/components/NumberField";
import { Password } from "./assets/components/PasswordField";
import { SelectField } from "./assets/components/SelectFieldAnd";
import { TextArea } from "./assets/components/TextAreaField";
import { Text } from "./assets/components/TextField";

/**
 * The shared field library every form in the app builds inputs from.
 * Trimmed to what the Kanban UI actually uses — Text/TextArea/Password
 * support both form mode (`form` + `name`) and controlled mode (`value` +
 * `setValue`); Number and SelectField are form-only (react-hook-form).
 */
export const CustomField = {
  Text,
  TextArea,
  Number,
  Password,
  SelectField,
};
