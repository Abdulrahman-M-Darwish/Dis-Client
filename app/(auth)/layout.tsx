import type { ReactNode } from "react";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";

export default function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<div className="bg-background text-foreground relative min-h-screen overflow-hidden">
			<div className="pointer-events-none absolute inset-0 z-50">
				<div className="absolute auth-orbit origin-bottom left-0 h-136 w-136 rounded-full bg-linear-to-br from-red-100/35 via-red-100/15 to-transparent blur-3xl" />
				<div className="absolute auth-orbit origin-top delay-[5s] right-0 h-136 w-136 rounded-full bg-linear-to-tl from-blue-100/40 via-blue-100/30 to-transparent blur-3xl" />
			</div>

			<div className="relative mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 lg:grid- cols-[1.05fr_0.95fr] justify-between">
				{/* <aside className="border-border/60 bg-muted/20 relative hidden flex-col justify-between gap-8 border-r p-10 lg:flex">
					<div className="flex flex-col gap-6">
						<Badge variant="secondary" className="w-fit">
							Auth Suite
						</Badge>
						<div>
							<h1 className="text-3xl font-semibold tracking-tight">
								Welcome to Dis
							</h1>
							<p className="text-muted-foreground mt-2 text-sm leading-relaxed">
								Sign in, verify your identity, and manage your account with
								secure, streamlined flows built for speed.
							</p>
						</div>
					</div>

					<div className="space-y-6">
						<div className="bg-background/40 border-border/50 rounded-2xl border p-5">
							<h2 className="text-sm font-medium">Auth Highlights</h2>
							<ul className="text-muted-foreground mt-3 space-y-2 text-sm">
								<li>OTP-based verification built in.</li>
								<li>Security-first password recovery.</li>
								<li>Clean flows that scale with your users.</li>
							</ul>
						</div>

						<Separator />

						<p className="text-muted-foreground text-xs">
							Need help? Reach out to support or review your policies before
							proceeding.
						</p>
					</div>
				</aside> */}

				<main className="flex items-center justify-center px-6 py-10">
					<div className="w-full max-w-md">{children}</div>
				</main>
			</div>
		</div>
	);
}
