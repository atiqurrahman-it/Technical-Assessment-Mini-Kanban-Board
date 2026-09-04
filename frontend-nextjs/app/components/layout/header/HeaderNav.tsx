"use client";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getHeaderMenuItems } from "./headerMenu";

const HeaderNav = () => {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const MenuList = getHeaderMenuItems(user?.role, pathname);

  const activeHref = MenuList
    .filter(
      (item) =>
        item.href &&
        (pathname === item.href || pathname.startsWith(item.href + "/")),
    )
    .sort((a, b) => (b.href?.length ?? 0) - (a.href?.length ?? 0))[0]?.href;

  return (
    <>
      {MenuList.length > 0 && (
        <nav className="hidden xl:flex items-center border-l border-white dark:border-[rgba(90,169,255,0.30)]">
          {MenuList.map((item, idx) => (
            <Link
              key={item?.href ? item.href + idx : idx}
              href={item?.href ?? ""}
              className={`flex min-h-12 items-center gap-2 border-r border-white dark:border-[rgba(90,169,255,0.30)] px-6 py-2 font-['Inter'] text-[14px] font-semibold leading-[24px] transition-colors ${
                item.href === activeHref
                  ? "text-[#008CFF]"
                  : "text-[#000855] dark:text-white"
              }`}
            >
              {item.label}
              {/* {item.hasDropdown && <ChevronDown size={13} className="opacity-70" />} */}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
};

export default HeaderNav;
