/* eslint-disable @typescript-eslint/no-explicit-any */

import { useAuthStore } from "@/store/authStore";
import { RemoveEmptyFields } from "@/utils/inputFiled/RemoveEmptyFields";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "./controller.tsx/fetchGetData";

interface Props {
  token?: string;
  filterData?: Record<string, any>;
  path: string;
  queryKey: string | any[];
  method?: "GET" | "POST";
  enabled?: boolean;
  withOutToken?: boolean;
}

const useFetchData = ({
  filterData = {},
  queryKey,
  method = "GET",
  path,
  token: explicitToken,
  withOutToken = false,
  enabled = true,
}: Props) => {
  const { token: authToken } = useAuthStore();
  const token = explicitToken || authToken || "";

  return useQuery({
    queryKey: [
      queryKey,
      {
        path,
        Method: method,
        token,
        queryParams: RemoveEmptyFields(filterData),
      },
    ],
    queryFn: fetchData,
    enabled: enabled && (withOutToken || !!token),
  });
};

export default useFetchData;
