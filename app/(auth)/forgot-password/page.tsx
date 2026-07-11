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

export default function ForgotPasswordPage() {
	return (
		<Card className="shadow-sm">
			<CardHeader className="gap-2">
				<CardTitle>Forgot your password?</CardTitle>
				<CardDescription>
					Enter your email and we will send a reset code.
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
									Use the email linked to your account.
								</FieldDescription>
							</FieldContent>
						</Field>
					</FieldGroup>

					<Button type="submit" size="lg" className="w-full">
						Send reset code
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
