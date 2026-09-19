import { Conversation, CreateConversationDto } from "@/types";
import { baseApi } from ".";

export const conversationsApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getAllConversations: builder.query<Conversation[], void>({
			query: () => ({
				url: "/conversations",
			}),
			providesTags: ["Conversation"],
		}),
		createConversation: builder.mutation<Conversation, CreateConversationDto>({
			query: (data) => ({ url: "/conversations", method: "POST", body: data }),
			invalidatesTags: ["Conversation"],
		}),
		updateConversation: builder.mutation<
			Conversation,
			Partial<CreateConversationDto> & Pick<Conversation, "_id">
		>({
			query: ({ _id, ...data }) => ({
				url: "/conversations/" + _id,
				method: "PATCH",
				body: data,
			}),
			invalidatesTags: ["Conversation"],
		}),
		removeConversation: builder.mutation({
			query: (conversationId) => ({
				url: "/conversations/" + conversationId,
				method: "DELETE",
			}),
			invalidatesTags: ["Conversation"],
		}),
		clearConversation: builder.mutation<{ message: string }, string>({
			query: (conversationId) => ({
				url: "/conversations/clear/" + conversationId,
				method: "PATCH",
			}),
			invalidatesTags: ["Conversation", "Messages"],
		}),
	}),
});

export const {
	useCreateConversationMutation,
	useGetAllConversationsQuery,
	useLazyGetAllConversationsQuery,
	useRemoveConversationMutation,
	useUpdateConversationMutation,
	useClearConversationMutation,
} = conversationsApi;
