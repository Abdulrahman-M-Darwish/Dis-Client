import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./api";
import { setupListeners } from "@reduxjs/toolkit/query/react";

export const store = configureStore({
	reducer: {
		[baseApi.reducerPath]: baseApi.reducer,
		// user: () => null,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
setupListeners(store.dispatch);
