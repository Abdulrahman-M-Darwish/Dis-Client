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
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginMutation } from "@/store/api/auth";
import { useRouter } from "next/navigation";

const schema = z.object({
	email: z.string().min(1),
	password: z.string().min(1),
});

export default function LoginPage() {
	const [login, { isError, error, isLoading, isSuccess }] = useLoginMutation();
	const form = useForm({
		resolver: zodResolver(schema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const loginErrorMessage =
		isError && error && typeof error === "object" && "status" in error
			? error.status === 401
				? "The email or password you entered is incorrect. Please try again."
				: "We couldn't sign you in right now. Please try again."
			: null;

	const router = useRouter();
	const onSubmit = async (data: z.infer<typeof schema>) => {
		const result = await login(data);

		if (result.data) {
			router.replace("/");
		}
	};
	return (
		<Card className="shadow-sm">
			<CardHeader className="gap-2">
				<CardTitle>Welcome back</CardTitle>
				<CardDescription>
					Sign in with your email and password to continue.
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
									<Input
										{...field}
										id="email"
										aria-invalid={fieldState.invalid}
										type="text"
										placeholder="you@company.com"
										autoComplete="email"
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
						<Controller
							name="password"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="password">Password</FieldLabel>
									<Input
										{...field}
										aria-invalid={fieldState.invalid}
										id="password"
										type="password"
										placeholder="••••••••"
										autoComplete="current-password"
									/>
									<FieldDescription className="flex justify-between items-center">
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
										<Button
											asChild
											variant="link"
											className="h-auto px-0 text-xs ml-auto"
										>
											<Link href="/forgot-password">Forgot password?</Link>
										</Button>
									</FieldDescription>
								</Field>
							)}
						/>
					</FieldGroup>

					{loginErrorMessage ? (
						<div
							role="alert"
							aria-live="polite"
							className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive shadow-sm"
						>
							{loginErrorMessage}
						</div>
					) : null}

					<Button
						type="submit"
						size="lg"
						className="w-full"
						disabled={isLoading || isSuccess}
						aria-busy={isLoading || isSuccess}
					>
						{isLoading ? "Signing in..." : "Sign in"}
					</Button>

					<Separator />
				</form>
			</CardContent>
			<CardFooter className="text-muted-foreground justify-between text-xs">
				<span>New To Des?</span>
				<Button asChild variant="link" className="h-auto px-0 text-xs">
					<Link href="/signup">Create an account</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
