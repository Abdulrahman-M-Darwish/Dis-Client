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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export default function SignupPage() {
	return (
		<Card className="shadow-sm">
			<CardHeader className="gap-2">
				<CardTitle>Create your account</CardTitle>
				<CardDescription>
					Set up your profile details to get started.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="space-y-5">
					<FieldGroup>
						<div className="grid gap-4 sm:grid-cols-2">
							<Field>
								<FieldLabel htmlFor="name">Full name</FieldLabel>
								<FieldContent>
									<Input id="name" placeholder="Jordan Lee" />
								</FieldContent>
							</Field>
							<Field>
								<FieldLabel htmlFor="username">Username</FieldLabel>
								<FieldContent>
									<Input id="username" placeholder="jordan.lee" />
								</FieldContent>
							</Field>
						</div>

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
							<FieldLabel htmlFor="password">Password</FieldLabel>
							<FieldContent>
								<Input
									id="password"
									type="password"
									placeholder="Create a secure password"
									autoComplete="new-password"
								/>
								<FieldDescription>
									Use 8+ characters with a mix of symbols.
								</FieldDescription>
							</FieldContent>
						</Field>
					</FieldGroup>

					<Button type="submit" size="lg" className="w-full">
						Create account
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
