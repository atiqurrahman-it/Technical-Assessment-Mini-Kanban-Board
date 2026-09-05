/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
"use client";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

/** Theme-token colors so the control matches the rest of the app in both light and dark mode. */
const inactiveButtonClass =
  "border-border bg-background text-foreground hover:bg-muted dark:border-input dark:bg-input/30 dark:hover:bg-input/50 rounded-lg";
const activeButtonClass =
  "bg-primary text-primary-foreground border-transparent shadow-xs hover:bg-primary/80 rounded-lg";

const CusPagination = ({
  totalPages = 1,
  setCurrentPage,
  currentPage,
}: {
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // const currentPage = Number(searchParams.get("page")) || 1;
  const router = useRouter();

  // url set
  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  // Number of page links to display at once
  const pageLinksToShow = 5;

  // Calculate the range of page numbers to display
  const startPage = Math.max(1, currentPage - Math.floor(pageLinksToShow / 2));
  const endPage = Math.min(totalPages, startPage + pageLinksToShow - 1);

  // console.log("totalPages ", totalPages);

  //   const handlePageChange = (page: number) => {
  //     const newURL = createPageURL(page);
  //     router.push(newURL);
  //     setCurrentPage?.(page);
  //   };

  const handlePageChange = (page: number) => {
    if (page === currentPage) return;
    setCurrentPage(page); // This will trigger the useEffect below
  };

  useEffect(() => {
    const newURL = createPageURL(currentPage);
    router.push(newURL);
  }, [currentPage]);

  return (
    <Pagination>
      <PaginationContent className="flex items-center justify-center gap-1.5">
        {/* Previous */}
        <PaginationItem>
          {currentPage === 1 ? (
            <PaginationPrevious className={cn(inactiveButtonClass, "pointer-events-none opacity-50")} />
          ) : (
            <PaginationPrevious
              className={cn(inactiveButtonClass, "cursor-pointer")}
              onClick={() => handlePageChange(currentPage - 1)}
            />
          )}
        </PaginationItem>

        {/* Always show first page */}
        {startPage > 1 && (
          <>
            <PaginationItem>
              <PaginationLink
                className={cn(inactiveButtonClass, "cursor-pointer")}
                onClick={() => handlePageChange(1)}
                isActive={false}
              >
                1
              </PaginationLink>
            </PaginationItem>
            {startPage > 2 && (
              <PaginationItem>
                <PaginationEllipsis className="text-muted-foreground" />
              </PaginationItem>
            )}
          </>
        )}

        {Array.from({ length: endPage - startPage + 1 }).map((_, index) => {
          const pageNum = startPage + index;
          const active = currentPage === pageNum;
          return (
            <PaginationItem key={index}>
              <PaginationLink
                className={cn("cursor-pointer", active ? activeButtonClass : inactiveButtonClass)}
                onClick={() => handlePageChange(pageNum)}
                isActive={active}
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {/* Always show last page */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <PaginationItem>
                <PaginationEllipsis className="text-muted-foreground" />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink
                className={cn(
                  "cursor-pointer",
                  currentPage === totalPages ? activeButtonClass : inactiveButtonClass,
                )}
                onClick={() => handlePageChange(totalPages)}
                isActive={currentPage === totalPages}
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        {/* Next */}
        <PaginationItem>
          {currentPage === totalPages ? (
            <PaginationNext className={cn(inactiveButtonClass, "pointer-events-none opacity-50")} />
          ) : (
            <PaginationNext
              className={cn(inactiveButtonClass, "cursor-pointer")}
              onClick={() => handlePageChange(currentPage + 1)}
            />
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
export default CusPagination;
