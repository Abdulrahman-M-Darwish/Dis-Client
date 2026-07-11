import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
	token: string | null;
	refreshToken: string | null;
};

const initialState: AuthState = {
	token: null,
	refreshToken: null,
};

export const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		tokenReceived: (
			state,
			action: PayloadAction<{ token: string; refreshToken: string }>,
		) => {
			state.token = action.payload.token;
			state.refreshToken = action.payload.refreshToken;
		},
		loggedOut: (state) => {
			state.token = null;
			state.refreshToken = null;
		},
	},
});

export const { tokenReceived, loggedOut } = authSlice.actions;
