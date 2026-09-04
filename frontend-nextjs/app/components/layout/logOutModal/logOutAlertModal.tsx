"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// import { useAuths } from "@/hooks/userContext";
import logoutIcon from "@/assets/logo/app-bar-and-header/logout.svg";
import ActionButton from "@/components/ui/custom/common/button/actionButton";
// import { useAuth } from "@/hook/useContext";
import Image from "next/image";
import { useState } from "react";

export function LogOutAlertModal({
  logoutPath,
  navigation = false,
}: {
  logoutPath: string;
  navigation?: boolean;
  pathName?: string;
}) {
  // const { signOut, isSignoutLoading } = useAuth();
  const signOut = () => {};
  const isSignoutLoading = false;

  const [open, setOpen] = useState(false);
  // const auth = useAuths();
  const handelLogOut = () => {
    signOut();
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          // href="/login"
          className={`flex items-center w-full justify-start cursor-pointer gap-2 xl:gap-3 p-2 xl:p-3  rounded-md  transition-all hover:bg-[#002F45]`}
        >
          <div className="flex gap-x-2 justify-start items-center w-full">
            {!navigation ? (
              <div className="relative z-auto xl:w-6 xl:h-6 w-[18px] h-[18px]">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Image
                        src={logoutIcon}
                        alt="logout"
                        className="object-fill absolute w-full h-full text-white"
                        fill
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Logout</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ) : (
              <div className="relative z-auto xl:w-6 xl:h-6 w-[18px] h-[18px]">
                <Image
                  src={logoutIcon}
                  alt="logout"
                  className="object-fill absolute w-full h-full text-white"
                  fill
                />
              </div>
            )}
            {navigation && (
              <span className="mt-1 text-white capitalize text-[12px]">
                Logout
              </span>
            )}
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            You will need to log in again to access your account.
          </DialogDescription>
        </DialogHeader>
        <div className="hidden"></div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="default"
              className="min-w-[110px] bg-[#013E5B] hover:bg-[#116b95] capitalize border-none outline-none cursor-pointer"
            >
              Close
            </Button>
          </DialogClose>
          <ActionButton
            handleOpen={handelLogOut}
            isPending={isSignoutLoading}
            type="submit"
            variant="destructive"
            buttonContent="Logout"
            className="w-full cursor-pointer"
            // className="bg-red-500 hover:bg-red-600"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
