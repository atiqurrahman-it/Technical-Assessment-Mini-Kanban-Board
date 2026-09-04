// "use client";
// import { Search } from "lucide-react";
// import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import { useDebouncedCallback } from "use-debounce";
// import { LabelAndPlaceholderTextFormat } from "../../../../../../utils/format/textCaseFormate";

// const CommonSearch = ({
//   width,
//   searchText,
//   setSearchText,
//   labelName,
//   placeholder = "Search",
//   disableLabelFormatting = false,
// }: {
//   width?: string;
//   searchText: string;
//   setSearchText: (text: string) => void;
//   placeholder?: string;
//   labelName?: string;
//   disableLabelFormatting?: boolean;

// }) => {
//   const searchParams = useSearchParams();
//   const pathname = usePathname();
//   const { replace } = useRouter();

//   const placeholderText = disableLabelFormatting ? placeholder : LabelAndPlaceholderTextFormat(placeholder);

//   const [inputValue, setInputValue] = useState(searchText); // Local state for input

//   useEffect(() => {
//     const updateInputValue = (value: string) => {
//       setInputValue(value);
//     };
//     updateInputValue(searchText || "");
//   }, [searchText]);

//   // useEffect(() => {
//   //   setInputValue(searchText || "");
//   // }, [searchText]);

//   // Debounced function to update the search state
//   const handleSearch = useDebouncedCallback((text: string) => {
//     if (setSearchText) {
//       setSearchText(text);
//     }
//     const params = new URLSearchParams(searchParams);
//     if (text) {
//       params.set("query", text);
//       params.delete("page");
//     } else {
//       params.delete("query");
//     }
//     replace(`${pathname}?${params.toString()}`);
//   }, 800);

//   // Update search text after 800ms when user stops typing
//   useEffect(() => {
//     // handleSearch(inputValue);
//     handleSearch(inputValue ?? ""); //only run if inputValue is not null TODO
//   }, [handleSearch, inputValue]); // Runs when inputValue changes

//   return (
//     <>
//       {labelName && (
//         <label className="font-semibold leading-6 text-[14px] tracking-[0.02em]">
//           {LabelAndPlaceholderTextFormat(labelName)}
//         </label>
//       )}

//       <div
//         className={`flex gap-x-2 justify-start items-center py-2 px-4 rounded-lg border bg-[#FFFFFF] ${
//           width ? `w-[${width}]` : "w-[150px] xl:w-[300px]"
//         } border border-[#CFD6DD]`}
//       >
//         <Search size={16} />
//         <input
//           type="text"
//           placeholder={placeholderText}
//           onChange={(e) => setInputValue(e.target.value)} // Update local state
//           value={inputValue}
//           className="w-full text-black bg-transparent outline-none grow placeholder:text-gray-500"
//         />
//       </div>
//     </>
//   );
// };

// export default CommonSearch;

"use client";

import { LabelAndPlaceholderTextFormat } from "@/utils/format/textCaseFormate";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

interface CommonSearchProps {
  width?: string;
  searchText: string;
  setSearchText: (text: string) => void;
  placeholder?: string;
  labelName?: string;
  disableLabelFormatting?: boolean;
}

const CommonSearchClient = ({
  width,
  searchText,
  setSearchText,
  placeholder = "Search",
  labelName,
  disableLabelFormatting = false,
}: CommonSearchProps) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const formattedPlaceholder = disableLabelFormatting
    ? placeholder
    : LabelAndPlaceholderTextFormat(placeholder);

  const [inputValue, setInputValue] = useState<string>(searchText ?? "");

  // keep external state in sync
  useEffect(() => {
    setInputValue(searchText ?? "");
  }, [searchText]);

  const handleSearch = useDebouncedCallback((text: string) => {
    setSearchText(text);

    const params = new URLSearchParams(searchParams.toString());

    if (text) {
      params.set("query", text);
      params.delete("page");
    } else {
      params.delete("query");
    }

    replace(`${pathname}?${params.toString()}`);
  }, 800);

  useEffect(() => {
    handleSearch(inputValue);
  }, [inputValue, handleSearch]);

  return (
    <>
      {labelName && (
        <label className="font-semibold leading-6 text-[14px] tracking-[0.02em]">
          {LabelAndPlaceholderTextFormat(labelName)}
        </label>
      )}

      <div
        className={`flex items-center gap-x-2 py-2 px-4 rounded-lg border bg-white/30 backdrop-blur-md border-white/40 dark:bg-white/5 dark:border-white/10 ${width}`}
      >
        <Search size={16} className="text-gray-500 dark:text-blue-100/60" />

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={formattedPlaceholder}
          className="text-[#1e293b] dark:text-blue-100/80 bg-transparent outline-none grow placeholder:text-gray-500 dark:placeholder:text-blue-100/40"
        />
      </div>
    </>
  );
};

const CommonSearch = (props: CommonSearchProps) => {
  return (
    <Suspense fallback={null}>
      <CommonSearchClient {...props} />
    </Suspense>
  );
};

export default CommonSearch;
