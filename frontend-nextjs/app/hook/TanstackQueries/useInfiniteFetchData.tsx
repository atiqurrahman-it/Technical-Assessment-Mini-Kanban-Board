/* eslint-disable @typescript-eslint/no-explicit-any */
import { useInfiniteQuery } from "@tanstack/react-query";
import { RemoveEmptyFields } from "@/utils/inputFiled/RemoveEmptyFields";
import { fetchData } from "./controller.tsx/fetchGetData";

interface InfiniteProps {
  filterData?: Record<string, any>;
  queryKey: string | any[];
  path: string;
  method?: "GET" | "POST";
  token?: string;
  enabled?: boolean;
  withOutToken?: boolean;
  getNextPageParam?: (lastPage: any, allPages: any[]) => number | undefined;
}

/**
 * Custom hook for infinite scrolling / paginated data fetching.
 * Extends `useInfiniteQuery` with the same API patterns used in `useFetchData`.
 */
const useInfiniteFetchData = ({
  filterData = {},
  queryKey,
  path,
  method = "GET",
  token: explicitToken,
  withOutToken = false,
  enabled = true,
  getNextPageParam = (lastPage) => {
    const pagination = lastPage?.data?.pagination;
    if (!pagination) return undefined;
    const { page, pageSize, totalCount } = pagination;
    const totalPages = Math.ceil(totalCount / pageSize);
    return page < totalPages ? page + 1 : undefined;
  },
}: InfiniteProps) => {
  const accessToken = "";
  const token = explicitToken || accessToken || "";

  const baseParams = RemoveEmptyFields(filterData);
  delete baseParams.page;

  return useInfiniteQuery({
    queryKey: [
      queryKey,
      { path, Method: method, token, queryParams: baseParams },
    ],
    queryFn: ({ pageParam = 1 }) => {
      const params = { ...baseParams, page: pageParam };
      return fetchData({
        queryKey: [{}, { path, Method: method, token, queryParams: params }],
      });
    },
    getNextPageParam,
    initialPageParam: 1,
    enabled: enabled && (withOutToken || !!token),
  });
};

export default useInfiniteFetchData;
