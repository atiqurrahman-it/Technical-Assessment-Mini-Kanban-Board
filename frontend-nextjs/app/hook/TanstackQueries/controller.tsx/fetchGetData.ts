/* eslint-disable @typescript-eslint/no-explicit-any */

import { handleApiError } from "@/utils/api-error-handaler/errorHandler";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Core data-fetching function used by both `useFetchData` and `useInfiniteFetchData`.
 *
 * Parses the compound query-key structure produced by those hooks and
 * makes the appropriate HTTP request via the native `fetch` API.
 *
 * Supports:
 * - GET with query parameters (including multi-value params)
 * - POST/PUT/PATCH/DELETE with JSON body
 * - Optional Bearer token authentication
 */
export const fetchData = async ({ queryKey }: any) => {
  const [_key, { path, Method, withOutToken, token, queryParams = {} }] =
    queryKey;

  const method = Method.toUpperCase();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Only add Bearer token when authentication is expected
  if (!withOutToken && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let url = `${API_URL}/${path}`;

  if (method === "GET") {
    const searchParams = new URLSearchParams();

    Object.entries(queryParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Support repeated query parameters (e.g. ?status=a&status=b)
        value.forEach((v) => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    if (queryString) url += `?${queryString}`;
  }

  const options: RequestInit = {
    method,
    headers,
    ...(method !== "GET" && { body: JSON.stringify(queryParams) }),
  };

  try {
    const response = await fetch(url, options);
    const responseData = await response.json();

    if (!response.ok) {
      throw {
        response: {
          status: response.status,
          data: responseData,
        },
      };
    }

    return responseData;
  } catch (error: any) {
    // Let the global error handler manage auth failures (401 → redirect to login)
    const handled = handleApiError(error) !== null;
    if (handled) {
      throw new Error("Handled API error");
    }
    const message =
      error?.response?.data?.message || error?.message || "Request failed";
    throw new Error(message);
  }
};
