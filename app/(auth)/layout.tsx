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
				<main className="flex items-center justify-center px-6 py-10">
					<div className="w-full max-w-md">{children}</div>
				</main>
			</div>
		</div>
	);
}
