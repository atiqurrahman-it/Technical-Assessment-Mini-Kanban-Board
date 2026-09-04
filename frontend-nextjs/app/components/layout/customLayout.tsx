"use client";
import { useNotFound } from "@/hooks/useNotFound";
import { PortalModeProvider } from "@/store/portalModeStore";
import { usePathname } from "next/navigation";
import React from "react";
import MainTopHeader from "./header";

const CustomLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { isNotFound } = useNotFound();

  if (isNotFound) return <>{children}</>;

  if (pathname === "/forgot") return <>{children}</>;

  return (
    <div className="p-5">
      <div className="min-h-[calc(100vh-60px)] max-w-[1600px] mx-auto  overflow-x-hidden rounded-2xl border-[2px] border-b dark:border-blue-500/20 border-gray-200 ">
        <div className="top-0 z-50 ">
          {/* toDO PortalModeProvider */}
          <PortalModeProvider>
            <MainTopHeader />
          </PortalModeProvider>
        </div>
        <div className="flex-1 h-full">{children}</div>
      </div>
    </div>
  );
};

export default CustomLayout;

// "use client";
// import { usePathname } from "next/navigation";
// import React from "react";
// import MainTopHeader from "./header";
// import { MenuProps, OthersMenuProps } from "./interface/MenuProps";

// const MainLayout = ({
//   children,
//   MenuList,
//   OthersMenu,
//   portalName,
// }: {
//   children: React.ReactNode;
//   MenuList: MenuProps[];
//   OthersMenu: OthersMenuProps[];
//   portalName?: string;
// }) => {
//   const pathname = usePathname();

//   if (pathname === "/forgot") return <>{children}</>;

//   return (
//     <div className="p-5">
//       <div className="min-h-[calc(100vh-60px)] max-w-[1600px] mx-auto  overflow-x-hidden rounded-2xl border-[2px] border-b dark:border-blue-500/20 border-gray-200 ">
//         <div className="top-0 z-50 ">
//           <MainTopHeader
//             MenuList={MenuList}
//             OthersMenu={OthersMenu}
//             portalName={portalName}
//           />
//         </div>
//         <div className="flex-1 h-full">{children}</div>
//       </div>
//     </div>
//   );
// };

// export default MainLayout;
