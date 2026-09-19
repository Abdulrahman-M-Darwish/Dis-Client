import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./api";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import { userSlice } from "./features/userSlice";
import { authSlice } from "./features/authSlice";
import { conversationsSlice } from "./features/conversationsSlice";

export const store = configureStore({
	reducer: {
		[baseApi.reducerPath]: baseApi.reducer,
		user: userSlice.reducer,
		auth: authSlice.reducer,
		conversations: conversationsSlice.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(baseApi.middleware),
});

setupListeners(store.dispatch);
