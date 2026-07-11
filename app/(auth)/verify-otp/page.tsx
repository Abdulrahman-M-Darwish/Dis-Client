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

export default function VerifyOtpPage() {
	return (
		<Card className="shadow-sm">
			<CardHeader className="gap-2">
				<CardTitle>Verify your email</CardTitle>
				<CardDescription>
					Enter the 6-digit code we sent to your inbox.
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
								<FieldDescription>
									We sent the code to this address.
								</FieldDescription>
							</FieldContent>
						</Field>

						<Field>
							<FieldLabel>OTP code</FieldLabel>
							<FieldContent>
								<div className="grid grid-cols-6 gap-2">
									{Array.from({ length: 6 }).map((_, index) => (
										<Input
											key={`otp-${index}`}
											inputMode="numeric"
											maxLength={1}
											className="text-center text-base"
											aria-label={`OTP digit ${index + 1}`}
										/>
									))}
								</div>
								<div className="text-muted-foreground mt-2 flex items-center justify-between text-xs">
									<span>Code expires in 10 minutes.</span>
									<Button
										type="button"
										variant="link"
										className="h-auto px-0 text-xs"
									>
										Resend code
									</Button>
								</div>
							</FieldContent>
						</Field>
					</FieldGroup>

					<Button type="submit" size="lg" className="w-full">
						Verify & continue
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
