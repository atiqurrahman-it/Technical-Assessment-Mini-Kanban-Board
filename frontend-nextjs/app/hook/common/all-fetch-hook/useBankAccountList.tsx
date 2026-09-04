/* eslint-disable @typescript-eslint/no-explicit-any */

import useFetchData from "@/hook/TanstackQueries/useFetchData";

/* Fetch Modules by Course Id */
function AllBankAccountList({
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
    path: path ?? `student-portal/access/accounts/list`,
    queryKey: `list-of-bank-account-list`,
    enabled,
    filterData: { ...filter },
  });
  // console.log(data, "Modules");

  const options = data?.data?.bankInfos?.map((item: any) => ({
    label: item.bankName || "Unknown",
    value: item?.id,
  }));

  return { options, data, isLoading, isError };
}

export default AllBankAccountList;
