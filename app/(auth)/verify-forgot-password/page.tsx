"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
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
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { useVerifyForgotPasswordMutation } from "@/store/api/auth";

export default function VerifyForgotPasswordPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const email = searchParams.get("email") ?? "";
	const [otp, setOtp] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [formError, setFormError] = useState<string | null>(null);
	const [verifyForgotPassword, { isLoading, isError, error }] =
		useVerifyForgotPasswordMutation();

	const verificationErrorMessage =
		isError && error && typeof error === "object" && "status" in error
			? error.status === 400 || error.status === 401
				? "The reset code is invalid or has expired. Please try again."
				: "We couldn't reset your password right now. Please try again."
			: null;

	const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!email) {
			setFormError(
				"We couldn't find your email. Please start the reset flow again.",
			);
			return;
		}

		if (otp.length !== 6) {
			setFormError("Enter the 6-digit code we sent to your email.");
			return;
		}

		if (newPassword.length < 8) {
			setFormError("Choose a password with at least 8 characters.");
			return;
		}

		if (newPassword !== confirmPassword) {
			setFormError("The passwords you entered do not match.");
			return;
		}

		setFormError(null);
		const result = await verifyForgotPassword({ email, otp, newPassword });

		if (result.data) {
			router.replace("/login");
		}
	};

	return (
		<Card className="shadow-sm">
			<CardHeader className="gap-2">
				<CardTitle>Verify reset code</CardTitle>
				<CardDescription>
					Confirm the OTP and choose a new password.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="space-y-5" onSubmit={onSubmit}>
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor="email">Email</FieldLabel>
							<FieldContent>
								<Input
									id="email"
									type="email"
									placeholder="you@company.com"
									autoComplete="email"
									value={email}
									disabled
								/>
							</FieldContent>
						</Field>

						<Field>
							<FieldLabel>OTP code</FieldLabel>
							<FieldContent>
								<InputOTP
									maxLength={6}
									value={otp}
									onChange={setOtp}
									aria-invalid={Boolean(formError || verificationErrorMessage)}
								>
									<InputOTPGroup className="flex grid-cols-6 gap-2 justify-between w-full">
										<InputOTPSlot
											index={0}
											className="rounded-lg w-14 h-14 text-lg"
										/>
										<InputOTPSlot
											index={1}
											className="rounded-lg w-14 h-14 text-lg"
										/>
										<InputOTPSlot
											index={2}
											className="rounded-lg w-14 h-14 text-lg"
										/>
										<InputOTPSlot
											index={3}
											className="rounded-lg w-14 h-14 text-lg"
										/>
										<InputOTPSlot
											index={4}
											className="rounded-lg w-14 h-14 text-lg"
										/>
										<InputOTPSlot
											index={5}
											className="rounded-lg w-14 h-14 text-lg"
										/>
									</InputOTPGroup>
								</InputOTP>
								<FieldDescription>
									Enter the 6-digit code sent to your email.
								</FieldDescription>
							</FieldContent>
						</Field>

						<Field>
							<FieldLabel htmlFor="newPassword">New password</FieldLabel>
							<FieldContent>
								<Input
									id="newPassword"
									type="password"
									placeholder="Create a new password"
									autoComplete="new-password"
									value={newPassword}
									onChange={(event) => setNewPassword(event.target.value)}
								/>
							</FieldContent>
						</Field>

						<Field>
							<FieldLabel htmlFor="confirmPassword">
								Confirm password
							</FieldLabel>
							<FieldContent>
								<Input
									id="confirmPassword"
									type="password"
									placeholder="Re-enter new password"
									autoComplete="new-password"
									value={confirmPassword}
									onChange={(event) => setConfirmPassword(event.target.value)}
								/>
							</FieldContent>
						</Field>
					</FieldGroup>

					{formError || verificationErrorMessage ? (
						<div
							role="alert"
							aria-live="polite"
							className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive shadow-sm"
						>
							{formError ?? verificationErrorMessage}
						</div>
					) : null}

					<Button
						type="submit"
						size="lg"
						className="w-full"
						disabled={isLoading}
						aria-busy={isLoading}
					>
						{isLoading ? "Resetting..." : "Reset password"}
					</Button>
				</form>
			</CardContent>
			<CardFooter className="text-muted-foreground justify-between text-xs">
				<span>Need a new code?</span>
				<div className="flex items-center gap-3">
					<Button type="button" variant="link" className="h-auto px-0 text-xs">
						Resend
					</Button>
					<Button asChild variant="link" className="h-auto px-0 text-xs">
						<Link href="/login">Back to login</Link>
					</Button>
				</div>
			</CardFooter>
		</Card>
	);
}
