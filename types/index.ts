export * from "./frontend-types";

export type RegisterPayload = {
	name: string;
	username: string;
	email: string;
	passwordHash: string;
	otp?: string;
};
