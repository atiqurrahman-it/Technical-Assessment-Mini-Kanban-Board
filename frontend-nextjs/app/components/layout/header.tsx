"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { usePathname, useRouter } from "next/navigation";
import HeaderLogo from "./header/HeaderLogo";
import HeaderMenuDrawer from "./header/HeaderMenuDrawer";
import HeaderNav from "./header/HeaderNav";
import HeaderUserInfo from "./header/HeaderUserInfo";

const MainTopHeader = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname === "/login" || pathname === "/verify-otp";
  // without login user can not profile access
  const { user } = useAuthStore();
  // console.log("user", user);
  // console.log("pathname", pathname === "/profile");
  const isProfilePage = pathname === "/profile";

  useEffect(() => {
    if (!user && isProfilePage) {
      router.push("/login");
    }
  }, [user, isProfilePage, router]);

  if (!user && isProfilePage) {
    return null;
  }
  return (
    <header className="flex h-16 w-full items-center gap-4 border-b border-b-[2px] dark:border-blue-500/20 border-gray-200  px-4   ">
      <HeaderLogo />
      {!isAuthPage && <HeaderMenuDrawer />}
      {isAuthPage ? (
        <div className="flex-1" />
      ) : (
        <div className="flex-1 flex justify-center">
          <HeaderNav />
        </div>
      )}
      <HeaderUserInfo simplified={isAuthPage || !user} />
    </header>
  );
};

export default MainTopHeader;
