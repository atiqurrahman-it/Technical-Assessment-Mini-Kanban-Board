/* eslint-disable @typescript-eslint/no-explicit-any */

import useFetchData from "@/hook/TanstackQueries/useFetchData";

/* Fetch Modules by Course Id */
function AllSecurityQuestion({
  path,
  filter,
  enabled,
}: {
  path?: string;
  filter?: any;
  enabled?: boolean;
}) {
  const { data, isLoading, isError } = useFetchData({
    method: "GET",
    path: path ?? `student-auth/security-questions`,
    queryKey: `fetch-security-questions-list`,
    enabled,
    filterData: { ...filter },
  });

  const options = data?.data?.questions?.map((item: any) => ({
    label: item.name || item.question || "Unknown",
    value: item?.id,
  }));

  return { options, data, isLoading, isError };
}

export default AllSecurityQuestion;
