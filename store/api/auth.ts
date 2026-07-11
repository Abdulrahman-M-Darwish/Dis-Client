import { RegisterPayload, User } from "@/types";
import { baseApi } from ".";

export const auth = baseApi.injectEndpoints({
	endpoints: (build) => ({
		register: build.mutation<string, RegisterPayload>({
			query: (data) => ({ url: "/auth/signup", method: "POST", body: data }),
		}),
		verifyRegistration: build.mutation<string, { email: string; otp: string }>({
			query: (data) => ({
				url: "/auth/verify-registration",
				method: "POST",
				body: data,
			}),
		}),
		login: build.mutation<
			{ token: string },
			{ email: string; password: string }
		>({
			query: (data) => ({ url: "/auth/signin", method: "POST", body: data }),
		}),
		me: build.query<User, void>({
			query: () => ({ url: "/auth/me", method: "GET" }),
		}),
		forgotPassword: build.mutation<string, { email: string }>({
			query: (data) => ({
				url: "/auth/forgot-password",
				method: "POST",
				body: data,
			}),
		}),
		verifyForgotPassword: build.mutation<
			string,
			{ email: string; otp: string }
		>({
			query: (data) => ({
				url: "/auth/verify-forgot-password",
				method: "POST",
				body: data,
			}),
		}),
		changePassword: build.mutation<
			string,
			{ email: string; newPassword: string }
		>({
			query: (data) => ({
				url: "/auth/change-password",
				method: "POST",
				body: data,
			}),
		}),
		refresh: build.mutation<{ token: string }, { refreshToken: string }>({
			query: (data) => ({
				url: "/auth/refresh",
				method: "POST",
				body: data,
			}),
		}),
	}),
});

export const {
	useChangePasswordMutation,
	useForgotPasswordMutation,
	useLazyMeQuery,
	useLoginMutation,
	useMeQuery,
	useRefreshMutation,
	useRegisterMutation,
	useVerifyForgotPasswordMutation,
	useVerifyRegistrationMutation,
} = auth;
