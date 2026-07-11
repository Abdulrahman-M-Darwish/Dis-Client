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
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function VerifyForgotPasswordPage() {
	return (
		<Card className="shadow-sm">
			<CardHeader className="gap-2">
				<CardTitle>Verify reset code</CardTitle>
				<CardDescription>
					Confirm the OTP and choose a new password.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="space-y-5">
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor="email">Email</FieldLabel>
							<FieldContent>
								<Input
									id="email"
									type="email"
									placeholder="you@company.com"
									autoComplete="email"
								/>
							</FieldContent>
						</Field>

						<Field>
							<FieldLabel>OTP code</FieldLabel>
							<FieldContent>
								<div className="grid grid-cols-6 gap-2">
									{Array.from({ length: 6 }).map((_, index) => (
										<Input
											key={`reset-otp-${index}`}
											inputMode="numeric"
											maxLength={1}
											className="text-center text-base"
											aria-label={`Reset OTP digit ${index + 1}`}
										/>
									))}
								</div>
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
								/>
							</FieldContent>
						</Field>
					</FieldGroup>

					<Button type="submit" size="lg" className="w-full">
						Reset password
					</Button>
				</form>
			</CardContent>
			<CardFooter className="text-muted-foreground justify-between text-xs">
				<span>Need a new code?</span>
				<div className="flex items-center gap-3">
					<Button
						type="button"
						variant="link"
						className="h-auto px-0 text-xs"
					>
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
