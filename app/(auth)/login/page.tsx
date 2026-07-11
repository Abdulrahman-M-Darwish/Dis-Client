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
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
	return (
		<Card className="shadow-sm">
			<CardHeader className="gap-2">
				<CardTitle>Welcome back</CardTitle>
				<CardDescription>
					Sign in with your email and password to continue.
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
									Use the email you signed up with.
								</FieldDescription>
							</FieldContent>
						</Field>
						<Field>
							<FieldLabel htmlFor="password">Password</FieldLabel>
							<FieldContent>
								<Input
									id="password"
									type="password"
									placeholder="••••••••"
									autoComplete="current-password"
								/>
								<div className="flex items-center justify-between text-xs">
									<span className="text-muted-foreground">
										At least 8 characters.
									</span>
									<Button asChild variant="link" className="h-auto px-0 text-xs">
										<Link href="/forgot-password">Forgot password?</Link>
									</Button>
								</div>
							</FieldContent>
						</Field>
					</FieldGroup>

					<Button type="submit" size="lg" className="w-full">
						Sign in
					</Button>

					<Separator />

					<div className="text-muted-foreground text-center text-xs">
						New to Dis?{" "}
						<Button asChild variant="link" className="h-auto px-0 text-xs">
							<Link href="/signup">Create an account</Link>
						</Button>
					</div>
				</form>
			</CardContent>
			<CardFooter className="text-muted-foreground justify-between text-xs">
				<span>Protected by OTP + secure recovery.</span>
				<Button asChild variant="outline" size="sm">
					<Link href="/verify-otp">Verify OTP</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
