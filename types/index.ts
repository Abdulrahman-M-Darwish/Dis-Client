export * from "./server";

export type RegisterPayload = {
	name: string;
	username: string;
	email: string;
	password: string;
	birthDate: string;
	gender: "male" | "female";
};
