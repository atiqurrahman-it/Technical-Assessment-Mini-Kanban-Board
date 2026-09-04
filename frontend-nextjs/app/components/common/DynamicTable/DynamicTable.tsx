/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * DynamicTableWithPagination Component
 *
 * Usage:
 *  - Import and use <DynamicTableWithPagination /> when you need a reusable table with:
 *    - Pagination
 *    - Dynamic columns
 *    - Optional row selection with checkboxes
 *    - Loading and empty states
 *
 *  Required Props:
 *  - data: any[] → Table row data
 *  - isLoading: boolean → Show loader while fetching data
 *  - pagination: { page, total, perPage?, totalPages } → Pagination object
 *  - currentPage: number → Current active page
 *  - setCurrentPage: (page: number) => void → Callback for changing page
 *  - config: TableConfig → Table configuration (columns, headers, rowClassName, etc.)
 *
 * Optional Props:
 *  - isCheckBox: boolean → Enables checkbox selection (default: false)
 *  - selectedIds: string[] → Currently selected row IDs
 *  - setSelectedIds: (ids: string[]) => void → Updates selected IDs
 *  - setSelectObject: (data: any[]) => void → Updates selected row objects
 *  - caption?: React.ReactNode → Custom header/toolbar area rendered above the table (e.g. title, filters, actions)
 *  - pageName?: string → (optional) For additional page-level context
 *
 * Dependencies:
 *  - DataLoader → Shows loading spinner
 *  - NoDataComponent → Displays when no data is available
 *  - CusPagination → Custom pagination component
 *  - @/components/ui/table → UI table components
 *
 * Example:
 * ```
 * <DynamicTableWithPagination
 *   data={users}
 *   isLoading={loading}
 *   pagination={pagination}
 *   currentPage={page}
 *   setCurrentPage={setPage}
 *   config={{
 *     columns: [
 *       { key: "name", header: "Name" },
 *       { key: "email", header: "Email" },
 *       { key: "actions", header: "Actions", render: (user) => <Button>Edit</Button> },
 *     ],
 *   }}
 *   isCheckBox
 *   selectedIds={selectedIds}
 *   setSelectedIds={setSelectedIds}
 *   setSelectObject={setSelectedObjects}
 * />
 * ```
 */

import DataLoader from "@/components/layout/components/dataLoader";
import NoDataComponent from "@/components/layout/components/empty";
import CusPagination from "@/components/ui/custom/common/pagination/paginations";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import PaginationLimit from "../fields/assets/cus_limitField";

/* eslint-disable no-unused-vars */

// Define types for table configurations
export type TableColumn = {
  key: string;
  header: string;
  className?: string;
  render?: (item: any, index: number) => React.ReactNode;
};

export type TableConfig = {
  columns: TableColumn[];
  emptyMessage?: string;
  showPagination?: boolean;
  rowClassName?: (item: any) => string;
  footer?: React.ReactNode;
  renderExpandableRow?: (item: any, index: number) => React.ReactNode;
};

interface Pagination {
  page: number;
  total: number;
  perPage?: number;
  totalPages: number;
}

interface DynamicTableProps {
  isLoading: boolean;
  pagination?: Pagination;
  // limit?: string | number;
  setPaginationLimit?: (limit: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  config: TableConfig;
  data: any;
  // checkbox
  isCheckBox?: boolean;
  selectedIds?: string[]; // or number[] depending on your ID type
  setSelectedIds?: (ids: string[]) => void;
  setSelectObject?: (data: any[]) => void;

  pageName?: string;
  renderExpandedRow?: (item: any, index: number) => React.ReactNode;
  selectedKeys?: string;
  caption?: React.ReactNode;
}

const DynamicTableWithPagination = ({
  data,
  isLoading,
  pagination,
  setPaginationLimit,
  currentPage,
  setCurrentPage,
  config,
  selectedIds = [],
  setSelectedIds = () => [],
  setSelectObject = () => [],
  isCheckBox = false,
  pageName,
  renderExpandedRow,
  selectedKeys,
  caption,
}: DynamicTableProps) => {
  const isEmpty = !isLoading && (!data || data.length === 0);

  // Helper function to update selected objects
  const updateSelectedObjects = (newSelectedIds: string[]) => {
    const filteredApplications = data.filter((item: any) =>
      newSelectedIds.includes(item.id),
    );
    setSelectObject(filteredApplications);
  };

  // check box
  const isRowSelected = (id: string) => selectedIds?.includes(id);

  const toggleRowSelection = (id: string) => {
    let newSelectedIds: string[];

    if (isRowSelected(id)) {
      newSelectedIds = selectedIds.filter((item) => item !== id);
    } else {
      newSelectedIds = [...selectedIds, id];
    }

    setSelectedIds(newSelectedIds);
    updateSelectedObjects(newSelectedIds);
  };

  const toggleSelectAll = () => {
    let newSelectedIds: string[];

    if (data.every((item: any) => isRowSelected(item.id))) {
      newSelectedIds = [];
    } else {
      newSelectedIds = data.map((item: any) => item.id);
    }

    setSelectedIds(newSelectedIds);
    updateSelectedObjects(newSelectedIds);
  };

  return (
    <div className="glass-table-container w-full text-slate-800 dark:text-slate-100">
      {caption && (
        <div className="flex items-center justify-between gap-4 flex-wrap p-4 border-b border-white/40 dark:border-cyan-500/20">
          {caption}
        </div>
      )}
      <Table className="w-full border-collapse bg-transparent text-slate-800 dark:text-slate-100">
        {pagination && pagination?.totalPages > 0 && (
          <TableCaption className=" p-4 border-t-0 bg-transparent text-slate-700 dark:text-slate-300 m-0">
            <div className="flex">
              <CusPagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={pagination?.totalPages}
              />
              {setPaginationLimit && (
                <div className="flex items-center gap-2">
                  <p>Page</p>
                  <PaginationLimit
                    setLimit={(value: string) =>
                      setPaginationLimit(Number(value))
                    }
                    // options={options}
                    totalItems={pagination?.total}
                    setCurrentPage={setCurrentPage}
                  />
                </div>
              )}
            </div>
          </TableCaption>
        )}

        <TableHeader className="bg-white/25 dark:bg-cyan-950/35 border-b border-white/60 dark:border-cyan-500/20">
          <TableRow className="hover:bg-transparent border-b border-white/60 dark:border-cyan-500/20">
            {isCheckBox && (
              <TableHead className="pl-4 w-4 text-center text-slate-800 dark:text-cyan-300 font-bold">
                <input
                  type="checkbox"
                  checked={
                    data?.length > 0 &&
                    data?.every((item: any) => isRowSelected(item.id))
                  }
                  onChange={toggleSelectAll}
                  aria-label="Select all rows"
                  className="w-4 h-4 rounded border-slate-300 dark:border-cyan-600 accent-blue-600 dark:accent-cyan-400 cursor-pointer"
                />
              </TableHead>
            )}
            {config?.columns.map((column, index) => (
              <TableHead
                key={column.key}
                className={`text-[#1e293b] dark:text-cyan-300 font-bold text-xs uppercase tracking-wider ${
                  column.className ?? ""
                } ${!isCheckBox && index === 0 ? "pl-5" : ""}`}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="w-full h-full divide-y divide-white/40 dark:divide-cyan-500/10">
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={config.columns.length + (isCheckBox ? 1 : 0)}
                className="min-h-[250px] lg:min-h-[400px] text-center"
              >
                <DataLoader />
              </TableCell>
            </TableRow>
          ) : isEmpty ? (
            <TableRow>
              <TableCell
                colSpan={config.columns.length + (isCheckBox ? 1 : 0)}
                className="w-full h-full text-center"
              >
                <NoDataComponent className="h-[250px]!" />
              </TableCell>
            </TableRow>
          ) : (
            data?.map((row: any, rowIndex: number) => (
              <React.Fragment key={rowIndex}>
                <TableRow
                  key={rowIndex}
                  className={`border-b border-white/40 dark:border-cyan-500/10 hover:bg-white/50 dark:hover:bg-cyan-500/15 transition-all duration-150 ${
                    config.rowClassName ? config.rowClassName(row) : ""
                  }`}
                >
                  {isCheckBox && (
                    <TableCell className="pl-4 text-center">
                      <input
                        type="checkbox"
                        checked={isRowSelected(row.id)}
                        onChange={() => toggleRowSelection(row.id)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-cyan-600 accent-blue-600 dark:accent-cyan-400 cursor-pointer"
                      />
                    </TableCell>
                  )}
                  {config?.columns.map((col, colIndex) => (
                    <TableCell
                      key={colIndex}
                      className={`text-[#1e293b] dark:text-slate-100 font-medium text-sm ${
                        col.className ?? ""
                      } ${!isCheckBox && colIndex === 0 ? "pl-5" : ""}`}
                    >
                      {col.render ? col.render(row, rowIndex) : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
                {renderExpandedRow &&
                  (() => {
                    const expandedContent = renderExpandedRow(row, rowIndex);
                    if (!expandedContent) return null;
                    return (
                      <TableRow className="bg-white/20 dark:bg-cyan-950/20 backdrop-blur-sm">
                        <TableCell
                          colSpan={config.columns.length + (isCheckBox ? 1 : 0)}
                        >
                          {expandedContent}
                        </TableCell>
                      </TableRow>
                    );
                  })()}
              </React.Fragment>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DynamicTableWithPagination;
