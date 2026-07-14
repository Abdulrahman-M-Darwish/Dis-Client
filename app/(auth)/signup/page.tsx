"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegisterMutation } from "@/store/api/auth";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

const schema = z.object({
	name: z.string().min(1, "Name is required"),
	username: z.string().min(1, "Username is required"),
	email: z.email("Enter a valid email address"),
	passwordHash: z
		.string()
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
		),
});

export default function SignupPage() {
	const [register, { isError, error, isLoading }] = useRegisterMutation();
	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: "",
			username: "",
			email: "",
			passwordHash: "",
		},
	});
	const router = useRouter();

	const signupErrorMessage =
		isError && error && typeof error === "object" && "status" in error
			? error.status === 401
				? "An account with this email already exists. Please try another one."
				: error.status === 500 || error.status === 503
					? "Email delivery failed. Please try again later."
					: "We couldn't create your account right now. Please try again."
			: null;

	const onSubmit = async (data: z.infer<typeof schema>) => {
		const result = await register({
			...data,
		});

		sessionStorage.setItem("registrationData", JSON.stringify(data));

		if (result.data) {
			router.replace(`/verify-otp`);
		}
	};

	return (
		<Card className="shadow-sm">
			<CardHeader className="gap-2">
				<CardTitle>Create your account</CardTitle>
				<CardDescription>
					Set up your profile details to get started.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
					<FieldGroup>
						<div className="grid gap-4 sm:grid-cols-2">
							<Controller
								name="name"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="name">Name</FieldLabel>
										<FieldContent>
											<Input
												{...field}
												id="name"
												aria-invalid={fieldState.invalid}
												placeholder="jordan.lee"
												autoComplete="name"
											/>
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
											)}
										</FieldContent>
									</Field>
								)}
							/>
							<Controller
								name="username"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="username">Username</FieldLabel>
										<FieldContent>
											<Input
												{...field}
												id="username"
												aria-invalid={fieldState.invalid}
												placeholder="Jordan Lee"
												autoComplete="username"
											/>
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
											)}
										</FieldContent>
									</Field>
								)}
							/>
						</div>

						<Controller
							name="email"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="email">Email</FieldLabel>
									<FieldContent>
										<Input
											{...field}
											id="email"
											aria-invalid={fieldState.invalid}
											type="email"
											placeholder="you@company.com"
											autoComplete="email"
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</FieldContent>
								</Field>
							)}
						/>

						<Controller
							name="passwordHash"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="password">Password</FieldLabel>
									<FieldContent>
										<Input
											{...field}
											id="password"
											aria-invalid={fieldState.invalid}
											type="password"
											placeholder="Create a secure password"
											autoComplete="new-password"
										/>
										<FieldDescription className="flex gap-2 flex-wrap pt-2">
											<Badge
												variant="secondary"
												className="text-xs"
												style={{
													backgroundColor:
														field.value.length > 8 ? "green" : "#f87171",
												}}
											>
												8+ characters
											</Badge>
											<Badge
												variant="secondary"
												className="text-xs"
												style={{
													backgroundColor: field.value.match(/[A-Z]/)
														? "green"
														: "#f87171",
												}}
											>
												1+ uppercase letter
											</Badge>
											<Badge
												variant="secondary"
												className="text-xs"
												style={{
													backgroundColor: field.value.match(/[a-z]/)
														? "green"
														: "#f87171",
												}}
											>
												1+ lowercase letter
											</Badge>
											<Badge
												variant="secondary"
												className="text-xs"
												style={{
													backgroundColor: field.value.match(/[@$!%*?&#]/)
														? "green"
														: "#f87171",
												}}
											>
												1+ symbol
											</Badge>
											<Badge
												variant="secondary"
												className="text-xs"
												style={{
													backgroundColor: field.value.match(/\d/)
														? "green"
														: "#f87171",
												}}
											>
												1+ number
											</Badge>
										</FieldDescription>
									</FieldContent>
								</Field>
							)}
						/>
					</FieldGroup>

					{signupErrorMessage ? (
						<div
							role="alert"
							aria-live="polite"
							className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive shadow-sm"
						>
							{signupErrorMessage}
						</div>
					) : null}

					<Button
						type="submit"
						size="lg"
						className="w-full"
						disabled={isLoading}
						aria-busy={isLoading}
					>
						{isLoading ? "Creating account..." : "Create account"}
					</Button>
				</form>
			</CardContent>
			<CardFooter className="text-muted-foreground justify-between text-xs">
				<span>Already have an account?</span>
				<Button asChild variant="link" className="h-auto px-0 text-xs">
					<Link href="/login">Sign in</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
