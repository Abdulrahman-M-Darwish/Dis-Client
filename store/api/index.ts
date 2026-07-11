import {
	BaseQueryFn,
	createApi,
	FetchArgs,
	fetchBaseQuery,
	FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";

// create a new mutex
const mutex = new Mutex();
const baseQuery = fetchBaseQuery({ baseUrl: "/" });
const baseQueryWithReauth: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError
> = async (args, api, extraOptions) => {
	// wait until the mutex is available without locking it
	await mutex.waitForUnlock();
	let result = await baseQuery(args, api, extraOptions);
	if (result.error && result.error.status === 401) {
		// checking whether the mutex is locked
		if (!mutex.isLocked()) {
			const release = await mutex.acquire();
			try {
				// try to get a new token
				const refreshResult = await baseQuery(
					"/auth/refresh",
					api,
					extraOptions,
				);
				if (refreshResult.data) {
					// store the new token
					api.dispatch(tokenReceived(refreshResult.data));
					// retry the initial query
					result = await baseQuery(args, api, extraOptions);
				} else {
					api.dispatch(loggedOut());
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
	baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL }),
	endpoints: () => ({}),
	tagTypes: ["User"],
});
