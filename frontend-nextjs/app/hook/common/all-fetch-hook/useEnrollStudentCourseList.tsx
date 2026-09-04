/* eslint-disable @typescript-eslint/no-explicit-any */

import useFetchData from "@/hook/TanstackQueries/useFetchData";

/* Fetch Modules by Course Id */
function AllEnrolledCourse({
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
    path: path ?? `student-portal/courses`,
    queryKey: `fetch-enrolled-courses-list`,
    enabled,
    filterData: { ...filter },
  });
  // console.log(data, "Modules");

  const options = data?.data?.courses?.map((item: any) => ({
    label: item.name || item.title || "Unknown",
    value: item?.sessionCourseId,
  }));

  return { options, data, isLoading, isError };
}

export default AllEnrolledCourse;
