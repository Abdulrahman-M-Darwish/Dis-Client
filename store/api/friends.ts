import { FriendRequest, User } from "@/types";
import { baseApi } from ".";

export type PendingRequests = {
	incoming: FriendRequest[];
	outgoing: FriendRequest[];
};

export const friendsApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		sendRequest: builder.mutation<FriendRequest, string>({
			query: (receiverId) => ({
				url: "/friends/request/" + receiverId,
				method: "POST",
			}),
			invalidatesTags: ["Friends"],
		}),
		acceptRequest: builder.mutation<FriendRequest, string>({
			query: (requestId) => ({
				url: `/friends/request/${requestId}/accept`,
				method: "PATCH",
			}),
			invalidatesTags: ["Friends"],
		}),
		cancelOrDeclineRequest: builder.mutation<string, string>({
			query: (requestId) => ({
				url: "/friends/request/" + requestId,
				method: "DELETE",
			}),
			invalidatesTags: ["Friends"],
		}),
		unfriend: builder.mutation<string, string>({
			query: (friendId) => ({ url: "/friends/" + friendId, method: "DELETE" }),
			invalidatesTags: ["Friends"],
		}),
		getFriends: builder.query<User[], void>({
			query: () => ({ url: "/friends" }),
			providesTags: ["Friends"],
		}),
		getPendingRequests: builder.query<PendingRequests, void>({
			query: () => ({ url: "/friends/requests" }),
			providesTags: ["Friends"],
		}),
	}),
});

export const {
	useAcceptRequestMutation,
	useCancelOrDeclineRequestMutation,
	useGetFriendsQuery,
	useGetPendingRequestsQuery,
	useLazyGetFriendsQuery,
	useLazyGetPendingRequestsQuery,
	useSendRequestMutation,
	useUnfriendMutation,
} = friendsApi;
