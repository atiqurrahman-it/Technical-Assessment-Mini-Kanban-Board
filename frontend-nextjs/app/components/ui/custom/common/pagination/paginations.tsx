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
      <PaginationContent className="flex items-center justify-center gap-3">
        {/* Previous */}
        <PaginationItem>
          {currentPage === 1 ? (
            <PaginationPrevious className="border border-white/40 dark:border-white/10 bg-white/20 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/10 backdrop-blur-md rounded-lg" />
          ) : (
            <PaginationPrevious
              className="cursor-pointer border border-white/40 dark:border-white/10 bg-white/20 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/10 backdrop-blur-md rounded-lg"
              onClick={() => handlePageChange(currentPage - 1)}
            />
          )}
        </PaginationItem>

        {/* Always show first page */}
        {startPage > 1 && (
          <>
            <PaginationItem>
              <PaginationLink
                className="cursor-pointer border border-white/40 dark:border-white/10 bg-white/20 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/10 backdrop-blur-md rounded-lg"
                onClick={() => handlePageChange(1)}
                isActive={false}
              >
                1
              </PaginationLink>
            </PaginationItem>
            {startPage > 2 && (
              <PaginationItem>
                <PaginationEllipsis className="text-gray-500 dark:text-blue-100/60" />
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
                className={cn(
                  "cursor-pointer rounded-lg backdrop-blur-md",
                  active
                    ? "bg-blue-600 text-white dark:bg-cyan-500 dark:text-white border-0 shadow-md"
                    : "border border-white/40 dark:border-white/10 bg-white/20 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/10 text-[#3b568b] dark:text-blue-100/80",
                )}
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
                <PaginationEllipsis className="text-gray-500 dark:text-blue-100/60" />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink
                className={cn(
                  "cursor-pointer rounded-lg backdrop-blur-md border border-white/40 dark:border-white/10 bg-white/20 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/10 text-[#3b568b] dark:text-blue-100/80",
                  currentPage === totalPages &&
                    "bg-blue-600 text-white dark:bg-cyan-500 dark:text-white border-0 shadow-md",
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
            <PaginationNext className="border border-white/40 dark:border-white/10 bg-white/20 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/10 backdrop-blur-md rounded-lg" />
          ) : (
            <PaginationNext
              className="cursor-pointer border border-white/40 dark:border-white/10 bg-white/20 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/10 backdrop-blur-md rounded-lg"
              onClick={() => handlePageChange(currentPage + 1)}
            />
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
export default CusPagination;
