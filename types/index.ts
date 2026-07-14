export * from "./server";

export type RegisterPayload = {
	name: string;
	username: string;
	email: string;
	passwordHash: string;
	otp?: string;
};
