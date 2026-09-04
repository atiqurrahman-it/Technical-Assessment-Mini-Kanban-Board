"use client";
import { LogoutModal } from "@/app/profile/_assets/components/LogoutModal";
import PortalModeToggle from "@/components/portal/PortalModeToggle";
import UploadDataButton from "@/components/upload-data/UploadDataButton";
import { useAuthStore } from "@/store/authStore";
import { ArrowLeft, LogOut, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getGreetingByTime } from "../utils/getTimeMessage";

const HeaderUserInfo = ({ simplified = false }: { simplified?: boolean }) => {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isSuperAdminInUserPortal =
    user?.role === "super_admin" && pathname.startsWith("/user/");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const isPortalPage =
    pathname.startsWith("/user/") || pathname.startsWith("/company-portal/");

  return (
    <div className="flex items-center gap-2 shrink-0">
      {!simplified && (
        <>
          {/* UPLOAD DATA — header version, only visible on xl+ screens.
              Below xl it lives at the top of the mobile drawer menu. */}
          <UploadDataButton className="hidden xl:flex" />
          {/* <span
            className={`hidden lg:block flex items-center gap-1 rounded-full px-3 py-1.5 font-['Inter'] text-[14px] font-semibold leading-[24px] transition-colors ${"text-[#000855] dark:text-white"}`}
          >
            {today}
          </span> */}
          {/* Notifications icon   */}
          <div className="flex items-center justify-center w-[38px] h-[38px] rounded-[60px] bg-[rgba(0,0,0,0.00)] shadow-[0_1px_2px_1px_rgba(90,169,255,0.30)] cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5">
            <Image
              src="assest/logo/header/bell.svg"
              alt="Notifications"
              width={20}
              height={20}
            />
          </div>

          {/* Profile icon with click dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-600 transition-colors hover:bg-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              <User className="h-4 w-4 text-white" />
            </div>

            {/* Dropdown menu */}
            {showProfileMenu && (
              <div
                className="absolute -right-25 top-full mt-2 min-h-40 w-65 rounded-xl border border-white/20 backdrop-blur-md dark:border-[rgba(0,229,255,0.08)] z-50 overflow-hidden"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.004) 0%, rgba(0,0,0,0.004) 100%)",
                  boxShadow:
                    "inset 0 1px 8.1px rgba(255,255,255,0.4), 0 10px 40px -10px rgba(0,0,0,0.2)",
                }}
              >
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none hidden dark:block"
                  style={{
                    boxShadow:
                      "inset 0 1px 8.1px rgba(0,136,255,0.15), 0 10px 40px -10px rgba(0,0,0,0.2)",
                  }}
                />
                <div className="border-b border-[#00e5ff]/10 dark:border-[rgba(0,229,255,0.08)]">
                  <>
                    <span
                      className={`hidden text-center mt-2 md:block flex items-center gap-1 rounded-full px-3 py-1.5 font-['Inter'] text-[14px] font-semibold leading-[24px] transition-colors ${"text-[#000855] dark:text-white"}`}
                    >
                      {today}
                    </span>
                    <p className="p-4 text-[#000855] dark:text-white">Hi, {getGreetingByTime()}</p>
                    {/* Profile */}
                    <Link
                      href="/profile"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <div className="mb-1 flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#000855] hover:bg-[#0088ff]/5 dark:text-white dark:hover:bg-[#0088ff]/10 cursor-pointer">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-700">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <p>Profile</p>
                      </div>
                    </Link>
                    {/* access  */}
                    {/* Super Admin in User Portal: Go Back + Mode Toggle */}
                    {isSuperAdminInUserPortal && (
                      <>
                        <Link
                          href="/super-admin"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <div className="mb-1 flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#000855] hover:bg-[#0088ff]/5 dark:text-white dark:hover:bg-[#0088ff]/10 cursor-pointer">
                            <ArrowLeft className="h-4 w-4" />
                            <p>Super Admin</p>
                          </div>
                        </Link>

                        <div
                          className="w-full py-3 px-2"
                          onClick={() => setShowProfileMenu(true)}
                        >
                          <PortalModeToggle />
                        </div>
                      </>
                    )}
                  </>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowLogoutModal(true);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#000855] hover:bg-[#0088ff]/5 dark:text-white dark:hover:bg-[#0088ff]/10 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {mounted && (
        <>
          {/* Compact single-icon theme toggle — only below 370px */}
          <button
            type="button"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            aria-label="Toggle theme"
            title={
              resolvedTheme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            className="min-[370px]:hidden flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-[#000855] transition-colors hover:bg-black/5 dark:border-blue-500/20 dark:text-white dark:hover:bg-white/5"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4 text-[#00E5FF]" />
            ) : (
              <Image
                src="/assest/logo/header/material-symbols_dark-mode-outline-rounded.svg"
                alt="Moon"
                width={16}
                height={16}
              />
            )}
          </button>

          {/* Full two-icon toggle — hidden below 370px */}
          <div
            className="max-[370px]:hidden flex items-center p-1 rounded-[10px] bg-[rgba(255,255,255,0.30)] dark:bg-[#03091E] border border-[rgba(255,255,255,0.78)] dark:border-blue-900/50 cursor-pointer transition-colors backdrop-blur-sm"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            title={
              resolvedTheme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {/* Left Icon (Inactive) */}
            <div className="flex h-8 w-11 items-center justify-center transition-all duration-300">
              {resolvedTheme === "dark" ? (
                <Sun className="h-5 w-5 text-[#7B8AB8] dark:text-[#4A5D8A]" />
              ) : (
                <Image
                  src="/assest/logo/header/material-symbols_dark-mode-outline-rounded.svg"
                  alt="Moon"
                  width={20}
                  height={20}
                  className="opacity-40 grayscale"
                />
              )}
            </div>

            {/* Right Icon (Active) */}
            <div
              className="flex h-[34px] w-[42px] items-center justify-center transition-all duration-300"
              style={{
                borderRadius: "10px",
                ...(resolvedTheme === "dark"
                  ? {
                      border: "1px solid #00E5FF",
                      background: "#000855",
                      boxShadow:
                        "0 0 11.491px 0 #08F inset, 0 0 6.566px 0 #08F, 0 0 3.83px 0 #08F, 0 0 1.915px 0 #08F inset, 0 0 0.547px 0 #08F, 0 0 0.274px 0 #08F",
                    }
                  : {
                      border: "1px solid #FFF",
                      background: "#08F",
                      boxShadow:
                        "0 0 11.491px 0 #FFF inset, 0 0 6.566px 0 #FFF, 0 0 3.83px 0 #FFF, 0 0 1.915px 0 #08F inset, 0 0 0.547px 0 #08F, 0 0 0.274px 0 #08F",
                    }),
              }}
            >
              {resolvedTheme === "dark" ? (
                <Image
                  src="/assest/logo/header/material-symbols_dark-mode-outline-rounded.svg"
                  alt="Dark Mode"
                  width={20}
                  height={20}
                />
              ) : (
                <Sun className="h-5 w-5 text-white" />
              )}
            </div>
          </div>
        </>
      )}
      <LogoutModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </div>
  );
};

export default HeaderUserInfo;
