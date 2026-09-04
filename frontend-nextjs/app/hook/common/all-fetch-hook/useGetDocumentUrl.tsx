/* eslint-disable @typescript-eslint/no-explicit-any */

import useFetchData from "@/hook/TanstackQueries/useFetchData";
export const parseDocumentPath = (rowImageUrl?: string) => {
  if (!rowImageUrl) return null;

  try {
    const pathObj = JSON.parse(rowImageUrl);
    return pathObj?.path ?? null;
  } catch {
    return null;
  }
};
const useGetDocumentUrl = ({
  normalized_path,
  rowImageUrl,
  enable,
}: {
  normalized_path?: string;
  rowImageUrl?: string;
  enable?: boolean;
} = {}) => {
  const normalizedPath = normalized_path || parseDocumentPath(rowImageUrl);
  console.log("normalizedPath", normalizedPath);
  // let normalizedPath = rowImageUrl;
  const { data, isLoading, isError } = useFetchData({
    path: normalizedPath ? `student-portal${normalizedPath}` : "",
    queryKey: "get-document-url",
    enabled:
      enable !== undefined ? enable && !!normalizedPath : !!normalizedPath,
  });

  //   const documentUrl = data?.data?.url;

  return { data, isLoading, isError };
};

export default useGetDocumentUrl;
