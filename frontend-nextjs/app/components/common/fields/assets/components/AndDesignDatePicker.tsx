// /* eslint-disable @typescript-eslint/no-explicit-any */
// import {
//   FormControl,
//   FormField,
//   FormItem,
//   FormMessage,
// } from "@/components/ui/form";
// // } from "@/components/ui/custom_ui/form"; TODO

// import { DatePicker as AntDatePicker, Space } from "antd";
// import dayjs from "dayjs";
// import { useEffect } from "react";
// import dateFormat from "../../../../../../utils/DateFormatter";
// import { LabelAndPlaceholderTextFormat } from "../../../../../../utils/format/textCaseFormate";
// import { InputInterface } from "../interface/inputPropsType";
// /**
//  * DatePickerAnd
//  * A reusable Ant Design DatePicker component integrated with react-hook-form.
//  *
//  * Features:
//  * - Supports "future", "previous", "normal", and "current" date selection modes.
//  * - Automatically sets today's date in "current" mode.
//  * - Supports disabled and edit-only modes.
//  */

// export const DatePickerAnd = ({
//   form,
//   name,
//   labelName,
//   placeholder,
//   required = false,
//   isEditMode = false,
//   isDisabled = false,
//   viewOnly = false,
//   type = "date",
//   mode = "normal",
//   defaultDateSelect = false,
//   disableLabelFormatting,
//   customMessage, //
//   onChange,
// }: InputInterface["DatePicker"]) => {
//   const now = dayjs();

//   const placeholderText = disableLabelFormatting
//     ? placeholder || "Select Date"
//     : LabelAndPlaceholderTextFormat(placeholder || "Select Date");

//   /**
//    * getDisabledDate
//    * Disables dates based on the selected mode:
//    * - "future": disables dates after today
//    * - "previous": disables dates before today
//    * - "normal": allows all dates
//    */

//   const getDisabledDate = (current: dayjs.Dayjs) => {
//     if (mode === "future") {
//       return current && current > now.endOf("day");
//     } else if (mode === "previous") {
//       return current && current < now.startOf("day");
//     }
//     return false; // "normal"
//   };

//   // dateUtils.ts
//   const format = dateFormat.getDateFormat(type);

//   /**
//    * Automatically set today's date if mode is "current"
//    * and no initial value is provided.
//    */

//   useEffect(() => {
//     const currentVal = form.getValues(name);
//     if (!currentVal) {
//       if (mode === "current" || defaultDateSelect) {
//         form.setValue(
//           name,
//           type === "date"
//             ? now.format(format) //
//             : type === "year"
//             ? now.year()
//             : now.format(format),
//           { shouldValidate: true }
//         );
//       }
//     }
//   }, [mode, form, name, now, type, format, defaultDateSelect]);

//   // useEffect(() => {
//   //   const currentVal = form.getValues(name);
//   //   if (mode === "current" && !currentVal) {
//   //     form.setValue(name, now.toDate());
//   //   }
//   // }, [mode, form, name, now]);

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
//                 {disableLabelFormatting
//                   ? labelName
//                   : LabelAndPlaceholderTextFormat(labelName)}
//                 {required && <span className="text-[#ff0000]">&nbsp;*</span>}
//               </label>
//             )}
//             {viewOnly ? (
//               // how view mode like TextArea
//               <div className="py-2 px-3 text-sm text-gray-900 bg-white rounded-md border border-gray-200 min-h-10">
//                 {/* {field.value ? dayjs(field.value).format("YYYY-MM-DD") : ""} */}
//                 {field.value ? dayjs(field.value).format(format) : ""}
//               </div>
//             ) : (
//               <FormControl>
//                 <div className="w-full!">
//                   <Space direction="vertical" className="w-full">
//                     <AntDatePicker
//                       picker={type}
//                       placeholder={placeholderText}
//                       className="w-full min-h-10"
//                       disabled={isEditMode || isDisabled}
//                       value={
//                         field.value
//                           ? type === "year"
//                             ? dayjs().year(field.value as number)
//                             : dayjs(field.value)
//                           : undefined
//                       }
//                       onChange={(date) => {
//                         if (!date) {
//                           form.setValue(name, undefined, {
//                             shouldValidate: true,
//                             shouldDirty: true,
//                           });

//                           if (onChange) {
//                               onChange(undefined as any);
//                             }
//                           return;
//                         }
//                         let value: any;

//                         switch (type) {
//                           case "date":
//                             value = new Date(date.format(format)); // YYYY-MM-DD string
//                             // value = date.toDate(); // full Date
//                             break;
//                           case "year":
//                             value = date.year(); // number
//                             break;
//                           default:
//                             value = date.format(format); // string
//                         }

//                         form.setValue(name, value, {
//                           shouldValidate: true,
//                           shouldDirty: true,
//                         });
//                         //external callback (same pattern as Text & Number)
//                         onChange?.(value);
//                       }}
//                       format={format}
//                       disabledDate={getDisabledDate}
//                     />
//                     {/* onChange={(date) => */}
//                     {/*   form.setValue( */}
//                     {/*     name, */}
//                     {/*     date ? dayjs(date).toDate() : undefined, */}
//                     {/*     { shouldValidate: true, shouldDirty: true }, //  trigger validation instantly */}
//                     {/*   ) */}
//                     {/* } */}
//                     {/* format="YYYY-MM-DD" */}
//                   </Space>
//                 </div>
//               </FormControl>
//             )}
//             {/* <FormMessage /> */}
//             <FormMessage>
//               {isError ? String(error?.message || "") : customMessage || ""}
//             </FormMessage>
//           </FormItem>
//         );
//       }}
//     />
//   );
// };
