"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { useForgotPasswordMutation } from "@/store/api/auth";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
	email: z.email("Enter a valid email address"),
});

export default function ForgotPasswordPage() {
	const router = useRouter();
	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			email: "",
		},
	});
	const [forgotPassword, { isLoading, isError, isSuccess, error }] =
		useForgotPasswordMutation();

	const forgotPasswordErrorMessage =
		isError && error && typeof error === "object" && "status" in error
			? error.status === 401
				? "We couldn't find an account with that email. Please try again."
				: "We couldn't send a reset code right now. Please try again."
			: null;

	const onSubmit = async (data: z.infer<typeof schema>) => {
		const result = await forgotPassword(data);

		if (result.data) {
			router.replace(
				`/verify-forgot-password?email=${encodeURIComponent(data.email)}`,
			);
		}
	};

	return (
		<Card className="shadow-sm">
			<CardHeader className="gap-2">
				<CardTitle>Forgot your password?</CardTitle>
				<CardDescription>
					Enter your email and we will send a reset code.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
					<FieldGroup>
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
											type="email"
											placeholder="you@company.com"
											autoComplete="email"
											aria-invalid={fieldState.invalid}
										/>
										{fieldState.invalid ? (
											<FieldError errors={[fieldState.error]} />
										) : null}
										<FieldDescription>
											Use the email linked to your account.
										</FieldDescription>
									</FieldContent>
								</Field>
							)}
						/>
					</FieldGroup>

					{forgotPasswordErrorMessage ? (
						<div
							role="alert"
							aria-live="polite"
							className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive shadow-sm"
						>
							{forgotPasswordErrorMessage}
						</div>
					) : null}

					{isSuccess ? (
						<div
							role="status"
							className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm"
						>
							If an account exists, we’ve sent a reset code to your email.
						</div>
					) : null}

					<Button
						disabled={isSuccess || isLoading}
						type="submit"
						size="lg"
						className="w-full"
						aria-busy={isLoading}
					>
						{isLoading ? "Sending..." : "Send reset code"}
					</Button>
				</form>
			</CardContent>
			<CardFooter className="text-muted-foreground justify-between text-xs">
				<span>Remembered your password?</span>
				<Button asChild variant="link" className="h-auto px-0 text-xs">
					<Link href="/login">Back to login</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
