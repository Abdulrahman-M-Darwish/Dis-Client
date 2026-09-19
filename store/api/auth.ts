import {
	ForgotPasswordDto,
	LoginDto,
	SignupDto,
	VerifyForgotPasswordDto,
} from "@/types";
import { baseApi } from ".";

export const auth = baseApi.injectEndpoints({
	endpoints: (build) => ({
		register: build.mutation<{ message: string }, SignupDto>({
			query: (data) => ({ url: "/auth/signup", method: "POST", body: data }),
		}),
		verifyRegistration: build.mutation<{ message: string }, SignupDto>({
			query: (data) => ({
				url: "/auth/verify-registration",
				method: "POST",
				body: data,
			}),
		}),
		login: build.mutation<{ accessToken: string }, LoginDto>({
			query: (data) => ({ url: "/auth/login", method: "POST", body: data }),
		}),
		forgotPassword: build.mutation<{ message: string }, ForgotPasswordDto>({
			query: (data) => ({
				url: "/auth/forgot-password",
				method: "POST",
				body: data,
			}),
		}),
		verifyForgotPassword: build.mutation<
			{ message: string },
			VerifyForgotPasswordDto
		>({
			query: (data) => ({
				url: "/auth/verify-forgot-password",
				method: "POST",
				body: data,
			}),
		}),
		refresh: build.mutation<{ accessToken: string }, void>({
			query: (data) => ({
				url: "/auth/refresh",
				method: "POST",
				body: data,
			}),
		}),
		logout: build.mutation<{ message: string }, void>({
			query: (data) => ({
				url: "/auth/logout",
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
	useLogoutMutation,
} = auth;
