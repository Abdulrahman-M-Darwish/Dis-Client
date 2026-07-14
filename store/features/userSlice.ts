import { User } from "@/types";
import { createSlice } from "@reduxjs/toolkit";

type InitialState = {
	user: User | null;
};

const initialState: InitialState = {
	user: null,
};

export const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		setUser: (state, action) => {
			state.user = action.payload;
		},
	},
});

export const { setUser } = userSlice.actions;
