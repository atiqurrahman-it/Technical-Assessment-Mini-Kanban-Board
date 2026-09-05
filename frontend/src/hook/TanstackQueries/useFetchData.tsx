/* eslint-disable @typescript-eslint/no-explicit-any */

import { useAuthStore } from "@/store/authStore";
import { RemoveEmptyFields } from "@/utils/inputFiled/RemoveEmptyFields";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchData } from "./fetchGetData";

interface Props {
  token?: string;
  filterData?: Record<string, any>;
  path: string;
  queryKey: string | any[];
  method?: "GET" | "POST";
  enabled?: boolean;
  withOutToken?: boolean;
  /** Keep showing the previous page's data (instead of flashing a loading state) while a new page/filter combination fetches — needed for paginated lists so controls don't unmount mid-refetch. */
  keepPreviousData?: boolean;
}

/**
 * The one hook every GET (and the occasional filter-heavy POST) goes
 * through — handles the auth header and builds a cache key from the request
 * shape automatically. Response shape: `data?.data` is the payload,
 * `data?.pagination` is pagination, matching `sendResponse` on the backend.
 */
const useFetchData = <T = any,>({
  filterData = {},
  queryKey,
  method = "GET",
  path,
  token: explicitToken,
  withOutToken = false,
  enabled = true,
  keepPreviousData: shouldKeepPreviousData = false,
}: Props) => {
  const { token: authToken } = useAuthStore();
  const token = explicitToken || authToken || "";

  return useQuery<T>({
    // Spread (not nest) `queryKey` so it stays a flat prefix of the real
    // cache key — `invalidateQueries({ queryKey: boardDetailKey(id) })`
    // partial-matches a prefix, not a key nested one level inside another.
    queryKey: [
      ...(Array.isArray(queryKey) ? queryKey : [queryKey]),
      {
        path,
        Method: method,
        token,
        queryParams: RemoveEmptyFields(filterData),
      },
    ],
    queryFn: fetchData,
    enabled: enabled && (withOutToken || !!token),
    placeholderData: shouldKeepPreviousData ? keepPreviousData : undefined,
  });
};

export default useFetchData;
