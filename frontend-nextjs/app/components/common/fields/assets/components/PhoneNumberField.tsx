// import {
//   FormControl,
//   FormField,
//   FormItem,
//   FormMessage,
// } from "@/components/ui/form";
// import { LabelAndPlaceholderTextFormat } from "../../../../../../utils/format/textCaseFormate";
// // } from "@/components/ui/custom_ui/form"; TODO

// // import { maskString } from "@/utils/maskString/maskString";
// import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/style.css";
// import { maskString } from "../../../../../../utils/maskString/maskString";
// import { InputInterface } from "../interface/inputPropsType";

// export const PhoneNumber = ({
//   form,
//   name,
//   labelName,
//   disabled = false,
//   required = false,
//   defaultCountry = "us",
//   disableCountryCode = true,
//   disableDropdown = false,
//   placeholder = "Enter phone number",
//   customMessage,
//   viewOnly = false,
//   onValueChange,
//   isLoading = false,
//   hasPhone = false,
//   disableLabelFormatting = false,
// }: InputInterface["PhoneNumber"]) => {
//   return (
//     <FormField
//       control={form.control}
//       name={name}
//       render={({ field }) => {
//         const error = form.formState.errors?.[name];
//         const isError = !!error;

//         return (
//           <FormItem>
//             {labelName && (
//               <label className="font-semibold text-[14px] leading-6 tracking-[0.02em]">
//                 {disableLabelFormatting ? labelName : LabelAndPlaceholderTextFormat(labelName)}
//                 {required && <span className="text-[#ff0000]">&nbsp;*</span>}
//               </label>
//             )}

//             {viewOnly ? (
//               <div className="min-h-10 px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-md">
//                 {hasPhone ? maskString(field.value) : field.value || ""}
//               </div>
//             ) : (
//               <>
//                 <FormControl>
//                   <PhoneInput
//                     containerClass="w-full"
//                     inputClass={`w-full ${isError ? "border-red-600" : ""}`}
//                     inputStyle={{
//                       width: "100%",
//                       padding: "20px 50px",
//                       ...(isError && { borderColor: "#dc2626" }),
//                     }}
//                     country={defaultCountry}
//                     value={field.value}
//                     searchStyle={{ width: "100%" }}
//                     disabled={disabled || isLoading}
//                     disableCountryCode={disableCountryCode}
//                     disableDropdown={disableDropdown}
//                     placeholder={disableLabelFormatting ? placeholder : LabelAndPlaceholderTextFormat(placeholder)}
//                     onChange={(value) => {
//                       field.onChange(value);
//                       if (onValueChange) onValueChange(value);
//                     }}
//                     onBlur={field.onBlur}
//                   />
//                 </FormControl>
//                 <FormMessage>
//                   {isError
//                     ? String(error?.message || "")
//                     : isLoading
//                     ? "Checking..."
//                     : customMessage || ""}
//                 </FormMessage>
//               </>
//             )}
//           </FormItem>
//         );
//       }}
//     />
//   );
// };
