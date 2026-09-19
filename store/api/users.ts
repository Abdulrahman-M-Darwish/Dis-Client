import { CreateUserDto, User } from "@/types";
import { baseApi } from ".";
import { setUser } from "../features/userSlice";

export const usersApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		searchUsers: builder.query<
			(User & { relationship: string; requestId?: string })[],
			string
		>({
			query: (query) => ({ url: "/users" + query }),
			providesTags: (result) =>
				result?.map((user) => ({ type: "User" as const, id: user._id })) ?? [],
		}),
		getMe: builder.query<User, void>({
			query: () => ({ url: "/users/me" }),
			providesTags: ["User"],
		}),
		getUser: builder.query<
			User & { relationship: string; requestId?: string },
			string
		>({
			query: (id) => ({ url: "/users/" + id }),
			providesTags: (result) =>
				result ? [{ type: "User" as const, id: result._id }] : [],
		}),
		updateUser: builder.mutation<
			User,
			Partial<CreateUserDto> & Pick<User, "_id">
		>({
			query: ({ _id, ...data }) => ({
				url: "/users/" + _id,
				method: "PATCH",
				body: data,
			}),
			invalidatesTags: ["User"],
			async onQueryStarted(args, { dispatch, queryFulfilled }) {
				try {
					const { data: updatedUser } = await queryFulfilled;
					dispatch(setUser(updatedUser)); // Updates state.user.user in Redux
				} catch (err) {
					console.error(err);
				}
			},
		}),
	}),
});

export const {
	useLazySearchUsersQuery,
	useSearchUsersQuery,
	useGetMeQuery,
	useLazyGetMeQuery,
	useGetUserQuery,
	useLazyGetUserQuery,
	useUpdateUserMutation,
} = usersApi;
