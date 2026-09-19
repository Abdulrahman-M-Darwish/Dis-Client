import { CreateMessageDto, GetMessagesDto, Message } from "@/types";
import { baseApi } from ".";

export const messagesApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getAllMessages: builder.query<Message[], GetMessagesDto>({
			query: (params) => ({
				url: `/messages`,
				params,
			}),
			providesTags: ["Messages"],
		}),
		getMessage: builder.query({
			query: (messageId) => ({
				url: "/messages/" + messageId,
			}),
			providesTags: ["Messages"],
		}),
		createMessage: builder.mutation({
			query: (data) => ({ url: "/messages", method: "POST", body: data }),
			invalidatesTags: ["Messages"],
		}),
		updateMessage: builder.mutation<
			Message,
			Partial<CreateMessageDto> & Pick<Message, "_id">
		>({
			query: ({ _id, ...data }) => ({
				url: "/messages/" + _id,
				method: "PATCH",
				body: data,
			}),
			invalidatesTags: ["Messages"],
		}),
		removeMessage: builder.mutation({
			query: (messageId) => ({
				url: "/messages/" + messageId,
				method: "DELETE",
			}),
			invalidatesTags: ["Messages"],
		}),
	}),
});

export const {
	useCreateMessageMutation,
	useGetAllMessagesQuery,
	useGetMessageQuery,
	useLazyGetAllMessagesQuery,
	useLazyGetMessageQuery,
	useRemoveMessageMutation,
	useUpdateMessageMutation,
} = messagesApi;
