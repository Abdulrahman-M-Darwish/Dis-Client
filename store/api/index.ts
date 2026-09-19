"use client";
import {
	BaseQueryFn,
	createApi,
	FetchArgs,
	fetchBaseQuery,
	FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import {} from "next/navigation";

// create a new mutex
const mutex = new Mutex();
const baseQuery = fetchBaseQuery({
	baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
	credentials: "include",
	prepareHeaders: (headers) => {
		const token = localStorage.getItem("accessToken");
		if (token) {
			headers.set("Authorization", `Bearer ${token}`);
		}
		return headers;
	},
});

const fetchBaseQueryWithReauth: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError
> = async (args, api, extraOptions) => {
	const url = typeof args === "string" ? args : args.url;
	const isPublicAuthRequest = [
		"/auth/login",
		"/auth/signup",
		"/auth/refresh",
		"/auth/forgot-password",
		"/auth/verify-forgot-password",
		"/auth/verify-registration",
	].some((path) => url.endsWith(path));

	// wait until the mutex is available without locking it
	await mutex.waitForUnlock();
	let result = await baseQuery(args, api, extraOptions);
	if (result.error && result.error.status === 401 && !isPublicAuthRequest) {
		// checking whether the mutex is locked
		if (!mutex.isLocked()) {
			const release = await mutex.acquire();
			try {
				// try to get a new token
				const refreshResult = (await baseQuery(
					{ url: "/auth/refresh", method: "POST", credentials: "include" },
					api,
					extraOptions,
				)) as { data: { accessToken: string }; error?: { status: number } };
				if (refreshResult.data) {
					// store the new token
					localStorage.setItem("accessToken", refreshResult.data.accessToken);
					// retry the initial query
					result = await baseQuery(args, api, extraOptions);
				} else {
					if (
						typeof window !== "undefined" &&
						refreshResult?.error?.status == 401
					) {
						localStorage.removeItem("accessToken");
						window.location.replace("/login");
					} else {
						// handle other errors, e.g., show a notification
						console.error("Failed to get refresh token:", refreshResult.error);
					}
				}
			} finally {
				release();
			}
		} else {
			// wait until the mutex is available, then retry
			await mutex.waitForUnlock();
			result = await baseQuery(args, api, extraOptions);
		}
	}
	return result;
};

export const baseApi = createApi({
	reducerPath: "baseApi",
	baseQuery: fetchBaseQueryWithReauth,
	endpoints: () => ({}),
	tagTypes: ["User", "Conversation", "Messages", "Friends"],
});
