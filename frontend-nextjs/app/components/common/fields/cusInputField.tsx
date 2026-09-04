// import CommonSearch from "../search/commonSearch";
// import { DatePickerAnd } from "./assets/components/AndDesignDatePicker";
import { CheckField } from "./assets/components/CheckField";
import CommonSearch from "./assets/components/commonSearch";
import { MultiCheckField } from "./assets/components/MultiCheckField";
import { Number } from "./assets/components/NumberField";
import { StringNumber } from "./assets/components/NumberText";
import { OTP } from "./assets/components/otpVerifyField";
import { Password } from "./assets/components/PasswordField";
// import { PhoneNumber } from "./assets/components/PhoneNumberField";
// import { UploadProfilePicture } from "./assets/components/ProfileUpload";
import { RadioField } from "./assets/components/RadioField";
import { SelectField } from "./assets/components/SelectFieldAnd";
import { SingleCheckField } from "./assets/components/SingleCheckField";
// import { RangeDatePickerAnd } from "./assets/components/RangeDatePicker";
// import RichTextEditor from "./assets/components/RichTextEditor";
import { SingleSelectField } from "./assets/components/SingleSelectField";
import { SwitchField } from "./assets/components/SwitchField";
import { TextArea } from "./assets/components/TextAreaField";
import { Text } from "./assets/components/TextField";
// import { UploadVideoFile } from "./assets/components/VideoUpload";
import DocumentUpload from "./assets/components/DocumentUpload";
// import { TextAreaWithFile } from "./assets/components/TextAreaWithFile";
import PaginationLimit from "./assets/cus_limitField";

export const CustomField = {
  Text,
  TextArea,
  Number,
  StringNumber,
  OTP,
  Password,
  // DatePickerAnd,
  SingleSelectField,
  SelectField,
  MultiCheckField,
  SingleCheckField,
  CheckField,
  RadioField,
  // RangeDatePickerAnd,
  // PhoneNumber,
  Switch: SwitchField,
  CommonSearch,
  // UploadProfilePicture,
  // UploadVideoFile,
  // RichTextEditor,
  // DynamicFileUploadField,
  LimitField: PaginationLimit,
  // TextAreaWithFile,
  DocumentUpload,
};
