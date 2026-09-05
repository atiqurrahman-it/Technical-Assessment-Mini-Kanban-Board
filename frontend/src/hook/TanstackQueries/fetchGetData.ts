import { QueryFunctionContext } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* eslint-disable @typescript-eslint/no-explicit-any */
interface QueryMeta {
  path: string;
  Method: "GET" | "POST";
  token: string;
  queryParams: Record<string, any>;
}

/**
 * The `queryFn` every `useFetchData` call shares. TanStack passes the full
 * query key back in, which is where `useFetchData` packed the request
 * details — see `useFetchData.tsx`.
 */
export async function fetchData({ queryKey }: QueryFunctionContext) {
  const meta = queryKey[queryKey.length - 1] as QueryMeta;
  const { path, Method, token, queryParams } = meta;

  const search = new URLSearchParams();
  Object.entries(queryParams || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();

  const res = await fetch(`${API_URL}/${path}${query ? `?${query}` : ""}`, {
    method: Method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw { response: { status: res.status, data: json } };
  }

  return json;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
