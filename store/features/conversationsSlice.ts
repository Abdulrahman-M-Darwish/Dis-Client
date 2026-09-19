import { Conversation } from "@/types";
import { createSlice } from "@reduxjs/toolkit";

type InitialState = {
	conversations: Conversation[] | null;
};

const initialState: InitialState = {
	conversations: null,
};

export const conversationsSlice = createSlice({
	name: "conversations",
	initialState,
	reducers: {
		setConversations: (state, action) => {
			state.conversations = action.payload;
		},
	},
});

export const { setConversations } = conversationsSlice.actions;
