import { RegisterPayload } from "@/types";
import { baseApi } from ".";

export const auth = baseApi.injectEndpoints({
	endpoints: (build) => ({
		register: build.mutation<{ message: string }, RegisterPayload>({
			query: (data) => ({ url: "/auth/signup", method: "POST", body: data }),
		}),
		verifyRegistration: build.mutation<{ message: string }, RegisterPayload>({
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
			query: (data) => ({ url: "/auth/login", method: "POST", body: data }),
		}),
		forgotPassword: build.mutation<{ message: string }, { email: string }>({
			query: (data) => ({
				url: "/auth/forgot-password",
				method: "POST",
				body: data,
			}),
		}),
		verifyForgotPassword: build.mutation<
			{ message: string },
			{ email: string; otp: string; newPassword: string }
		>({
			query: (data) => ({
				url: "/auth/verify-forgot-password",
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
	useForgotPasswordMutation,
	useLoginMutation,
	useRefreshMutation,
	useRegisterMutation,
	useVerifyForgotPasswordMutation,
	useVerifyRegistrationMutation,
} = auth;
