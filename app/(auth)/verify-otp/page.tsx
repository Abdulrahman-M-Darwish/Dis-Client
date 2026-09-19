"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
import { FieldLabel } from "@/components/ui/field";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import {
	useRegisterMutation,
	useVerifyRegistrationMutation,
} from "@/store/api/auth";
import { RegisterPayload } from "@/types";

export default function VerifyOtpPage() {
	const router = useRouter();
	const [data, setData] = useState<RegisterPayload | null>(null);
	const [otp, setOtp] = useState("");
	const [isResendDisabled, setIsResendDisabled] = useState(false);
	const [verifyRegistration, { isLoading, isError, error, isSuccess }] =
		useVerifyRegistrationMutation();
	const [resend] = useRegisterMutation();
	const [localErrorMessage, setLocalErrorMessage] = useState<string | null>(
		null,
	);
	const verificationErrorMessage =
		isError && error && typeof error === "object" && "status" in error
			? error.status === 400 || error.status === 401
				? "The OTP code is incorrect or has expired. Please try again."
				: "We couldn't verify your account right now. Please try again."
			: null;

	const displayErrorMessage = localErrorMessage ?? verificationErrorMessage;

	const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!data?.email) {
			setLocalErrorMessage(
				"We couldn't find your signup email. Please start over from the signup page.",
			);
			return;
		}

		if (otp.length !== 6) {
			setLocalErrorMessage(
				"Enter the 6-characters code we sent to your email.",
			);
			return;
		}

		setLocalErrorMessage(null);
		const result = await verifyRegistration({ ...data!, otp });

		if (result.data) {
			sessionStorage.removeItem("registrationData");
			router.replace("/");
		}
	};

	const resendOtp = async () => {
		if (!data) {
			setLocalErrorMessage(
				"We couldn't find your signup email. Please start over from the signup page.",
			);
			return;
		}
		await resend(data);
		setIsResendDisabled(true);
		setTimeout(() => setIsResendDisabled(false), 1000 * 60);
	};

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setData(
			JSON.parse(
				sessionStorage.getItem("registrationData")!,
			) as RegisterPayload,
		);
	}, []);

	return (
		<Card className="shadow-sm">
			<CardHeader className="gap-2">
				<CardTitle>Verify your email</CardTitle>
				<CardDescription>
					Enter the 6-digit code we sent to your inbox.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="space-y-5" onSubmit={onSubmit}>
					<div className="space-y-2">
						<FieldLabel>OTP code</FieldLabel>
						<InputOTP
							maxLength={6}
							value={otp}
							onChange={setOtp}
							aria-invalid={Boolean(displayErrorMessage)}
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
					</div>

					<div className="text-muted-foreground mt-2 flex items-center justify-between text-xs">
						<span>
							{data?.email
								? `Code sent to ${data?.email}`
								: "Code expires in 5 minutes."}
						</span>
						<Button
							disabled={isResendDisabled}
							type="button"
							variant="link"
							className="h-auto px-0 text-xs cursor-pointer"
							onClick={resendOtp}
						>
							Resend code
						</Button>
					</div>

					{displayErrorMessage ? (
						<div
							role="alert"
							aria-live="polite"
							className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive shadow-sm"
						>
							{displayErrorMessage}
						</div>
					) : null}

					<Button
						type="submit"
						size="lg"
						className="w-full"
						disabled={isLoading || isSuccess}
						aria-busy={isLoading || isSuccess}
					>
						{isLoading ? "Verifying..." : "Verify & continue"}
					</Button>
				</form>
			</CardContent>
			<CardFooter className="text-muted-foreground justify-between text-xs">
				<span>Need to change your details?</span>
				<Button asChild variant="link" className="h-auto px-0 text-xs">
					<Link href="/signup">Back to signup</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
