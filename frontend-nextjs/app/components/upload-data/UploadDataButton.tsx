"use client";
import { useAuthStore } from "@/store/authStore";
import { getStoredPortalMode } from "@/store/portalModeStore";
import { Upload } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import UploadDataModal from "./UploadDataModal";

interface UploadDataButtonProps {
  /** Extra classes — e.g. `hidden xl:flex` in the header, `w-full justify-center` in the drawer */
  className?: string;
}

/**
 * UPLOAD DATA button + its modal.
 * Visible for `company_admin` (always) and `super_admin` while portal edit
 * mode is ON. Reused in the header (xl+ screens) and the mobile drawer menu.
 */
const UploadDataButton = ({ className = "" }: UploadDataButtonProps) => {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [portalEditMode, setPortalEditMode] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Sync portal edit mode from localStorage (written by PortalModeProvider)
  const syncEditMode = useCallback(() => {
    const role = user?.role;
    if (role === "company_admin") {
      setPortalEditMode(true);
    } else if (role === "super_admin") {
      setPortalEditMode(getStoredPortalMode() === "edit");
    } else {
      setPortalEditMode(false);
    }
  }, [user?.role]);

  useEffect(() => {
    setMounted(true);
    syncEditMode();

    // Listen for portal mode changes from PortalModeProvider
    window.addEventListener("portal-mode-changed", syncEditMode);
    return () =>
      window.removeEventListener("portal-mode-changed", syncEditMode);
  }, [syncEditMode]);

  const canUpload =
    mounted &&
    (user?.role === "company_admin" ||
      (user?.role === "super_admin" && portalEditMode));

  if (!canUpload) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setUploadModalOpen(true)}
        className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] border border-white bg-[#08F] shadow-[0_0_11.491px_0_#FFF_inset,0_0_6.566px_0_#FFF,0_0_3.83px_0_#FFF,0_0_1.915px_0_#08F_inset,0_0_0.547px_0_#08F,0_0_0.274px_0_#08F] dark:border-[rgba(0,229,255,0.58)] dark:bg-[#000855] dark:shadow-[0_0_20px_0_#08F_inset,0_0_0.547px_0_#08F,0_0_0.274px_0_#08F] text-white font-['Inter'] text-[13px] font-medium leading-[24px] transition-all hover:opacity-90 ${className}`}
      >
        <Upload size={13} />
        UPLOAD DATA
      </button>
      <UploadDataModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
      />
    </>
  );
};

export default UploadDataButton;
