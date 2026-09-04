"use client";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import UploadDataButton from "@/components/upload-data/UploadDataButton";
import { useAuthStore } from "@/store/authStore";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { getHeaderMenuItems } from "./headerMenu";
import HeaderLogo from "./HeaderLogo";

/**
 * Mobile navigation — visible only below `xl`.
 * A hamburger button opens a left-side drawer containing the same
 * menu items as the desktop HeaderNav, with a close option.
 *
 * NOTE: `xl:hidden` lives on the wrapper div and `flex` on the button —
 * they must NOT share the same element (`.hidden` wins over `.flex` in
 * the generated CSS, which would hide the button at every breakpoint).
 */
const HeaderMenuDrawer = () => {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);

  const MenuList = getHeaderMenuItems(user?.role, pathname);

  const activeHref = MenuList
    .filter(
      (item) =>
        item.href &&
        (pathname === item.href || pathname.startsWith(item.href + "/")),
    )
    .sort((a, b) => (b.href?.length ?? 0) - (a.href?.length ?? 0))[0]?.href;

  return (
    <Drawer direction="left" open={open} onOpenChange={setOpen}>
      {/* Hamburger trigger — wrapper hidden at xl+, button always flex */}
      <div className="xl:hidden">
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-gray-200 text-[#000855] transition-colors hover:bg-black/5 dark:border-blue-500/20 dark:text-white dark:hover:bg-white/5"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <DrawerContent className="w-[280px] max-w-[85vw] bg-white dark:bg-[#03091E] sm:max-w-[280px]">
        {/* Drawer header — logo + close */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-4 dark:border-blue-500/20">
          <DrawerTitle className="sr-only">Menu</DrawerTitle>
          <HeaderLogo />
          <DrawerClose asChild>
            <button
              type="button"
              aria-label="Close menu"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] text-[#000855] transition-colors hover:bg-black/5 dark:text-white dark:hover:bg-white/5"
            >
              <X className="h-5 w-5" />
            </button>
          </DrawerClose>
        </div>

        {/* UPLOAD DATA — top of the drawer menu (replaces the hidden
            header button below xl) */}
        <div className="px-3 pt-3">
          <UploadDataButton className="w-full justify-center" />
        </div>

        {/* Menu list */}
        <nav className="flex-1 overflow-y-auto p-3">
          {MenuList.map((item, idx) => (
            <Link
              key={item?.href ? item.href + idx : `item-${idx}`}
              href={item?.href ?? ""}
              onClick={() => setOpen(false)}
              className={`mb-1 flex min-h-11 items-center rounded-[10px] px-4 py-2 font-['Inter'] text-[14px] font-semibold leading-[24px] transition-colors ${
                item.href === activeHref
                  ? "bg-[#008CFF]/10 text-[#008CFF]"
                  : "text-[#000855] hover:bg-black/5 dark:text-white dark:hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </DrawerContent>
    </Drawer>
  );
};

export default HeaderMenuDrawer;
