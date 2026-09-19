"use client";

import { useRouter } from "next/navigation";

export default function FailurePage() {
	const router = useRouter();

	return (
		<main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
			<section className="max-w-md space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-xl">
				<h1 className="text-2xl font-semibold">Unable to reach the server</h1>
				<p className="text-sm text-slate-400">
					Check your connection and try again in a moment.
				</p>
				<button
					onClick={() => router.back()}
					className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-slate-950"
				>
					Go back
				</button>
			</section>
		</main>
	);
}
