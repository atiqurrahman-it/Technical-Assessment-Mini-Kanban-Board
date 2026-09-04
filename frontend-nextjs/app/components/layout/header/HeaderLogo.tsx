"use client";
import Image from "next/image";
import Link from "next/link";

const HeaderLogo = () => {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      {/* <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30 dark:shadow-blue-900/60">
        <Globe className="w-4 h-4 text-white" />
      </div> */}
      <Image
        src="/assest/logo/header/header-logo.svg"
        alt="Logo"
        width={38}
        height={38}
      />
      <span className="hidden xl:block whitespace-nowrap font-['Inter'] text-[14px] font-semibold leading-[24px] text-[#000855] dark:text-white">
        GCC Customs Analytics
      </span>
    </Link>
  );
};

export default HeaderLogo;
