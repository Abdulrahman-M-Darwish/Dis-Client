"use client";

import { ArrowLeft, Calendar, CircleAlert } from "lucide-react";
import { useAppSelector } from "@/hooks";
import React, { useEffect, useState } from "react";
import { useLazyGetUserQuery } from "@/store/api/users";
import { User, UserStatus } from "@/types";
import { useRouter } from "next/navigation";
import Image from "next/image";
import UpdateProfileModal from "@/components/UpdateProfileModal";
import { CancelButton } from "../../search/CancelButton";
import { AcceptButton } from "../../search/AcceptButton";
import { DeclineButton } from "../../search/DeclineButton";
import { AddFriendButton } from "../../search/AddFriendButton";
import { UnfriendButton } from "../../search/UnfriendButton";
import { isConnectionError } from "@/utils";

export default function UserProfilePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = React.use(params);
	const currentUser = useAppSelector((state) => state.user.user);
	const [getUser, { isLoading, isUninitialized }] = useLazyGetUserQuery();
	const [user, setUser] = useState<
		(User & { relationship: string; requestId?: string }) | null
	>(null);
	const router = useRouter();
	const isMe = id === currentUser?._id;

	useEffect(() => {
		const setUserProfile = async () => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			if (isMe) setUser(currentUser as any);
			else {
				const userProfile = await getUser(id);
				if ("error" in userProfile && isConnectionError(userProfile.error)) {
					router.push("/failure");
					return;
				}
				if (userProfile.data) setUser(userProfile.data);
			}
		};
		setUserProfile();
	}, [currentUser, getUser, id, isMe, router]);

	// Format date helper
	const formatLastSeen = (dateInput?: string | Date) => {
		if (!dateInput) return "Long time ago";
		const date = new Date(dateInput);
		return date.toLocaleDateString(undefined, {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};
	if (isLoading) return "Loading...";
	else if (!user) return isUninitialized ? "loading" : "user not found";
	return (
		<div className="flex-1 flex flex-col min-h-screen bg-slate-950 bg-[radial-gradient(circle_at_top_left,var(--primary),transparent_25%)] text-slate-100 p-4 sm:p-6 md:p-8">
			<div className="max-w-4xl mx-auto w-full space-y-6">
				{/* Navigation / Top Bar */}
				<div className="flex justify-between items-center">
					{!isMe && (
						<button
							onClick={() => router.back()}
							className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-100 transition group"
						>
							<ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
							Back to Directory
						</button>
					)}
					<div className="ml-auto">{isMe && <UpdateProfileModal />}</div>
				</div>

				{/* Profile Card Header Block */}
				<div className="bg-slate-900/40 border border-foreground/10 rounded-3xl overflow-hidden backdrop-blur-md">
					{/* Banner Spot */}
					<div className="h-44 w-full relative bg-linear-to-r from-slate-900 to-slate-800 overflow-hidden border-b border-foreground/5">
						{user.bannerUrl ? (
							<Image
								fill
								src={user.bannerUrl}
								alt={`${user.username}'s banner`}
								className="w-full h-full object-cover"
							/>
						) : (
							// Abstract grid placeholder if no banner exists
							<div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-size-[1rem_1rem]" />
						)}
					</div>

					{/* Identity Info Container */}
					<div className="px-6 pb-6 relative flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-12">
						{/* Left: Avatar Stack & Title text */}
						<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
							<div className="relative shrink-0 z-10">
								{user.avatarUrl ? (
									<Image
										src={user.avatarUrl}
										width={96}
										height={96}
										alt={user.username}
										className="h-24 w-24 rounded-2xl border-4 border-slate-950 object-cover shadow-xl bg-slate-900"
									/>
								) : (
									<div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-slate-950 bg-linear-to-br from-primary/80 to-primary font-bold text-slate-950 text-3xl shadow-xl">
										{user.username?.charAt(0).toUpperCase()}
									</div>
								)}
							</div>

							<div className="flex flex-col  flex-wrap">
								<h2 className="text-2xl font-bold tracking-tight text-slate-100">
									{user.username}
								</h2>
								<span className="text-xs rounded-full text-slate-400 font-medium">
									@{user.name}
								</span>
							</div>
						</div>
						{!isMe && (
							<div className="flex items-center gap-2  w-auto">
								<AddFriendButton
									relationship={user.relationship}
									userId={user._id}
								/>
								<CancelButton
									relationship={user.relationship}
									requestId={user?.requestId}
								/>
								<DeclineButton
									relationship={user.relationship}
									requestId={user?.requestId}
								/>
								<AcceptButton
									relationship={user.relationship}
									requestId={user?.requestId}
								/>
								<UnfriendButton
									relationship={user.relationship}
									userId={user?._id}
								/>
							</div>
						)}
					</div>
				</div>

				{/* Main Content Layout Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* Bio and About card */}
					<div className="md:col-span-2 space-y-6">
						<div className="bg-slate-900/40 border border-foreground/10 rounded-3xl p-5 backdrop-blur-md space-y-4">
							<div className="flex items-center gap-2 border-b border-foreground/10 pb-3">
								<CircleAlert className="w-4 h-4 text-primary" />
								<h3 className="text-sm font-semibold tracking-wide uppercase text-slate-300">
									About Me
								</h3>
							</div>

							<p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
								{user.bio ? user.bio : "This user hasn't added a bio yet."}
							</p>
						</div>
					</div>

					{/* Quick Meta Data Metadata Sidebar card */}
					<div className="space-y-6">
						<div className="bg-slate-900/40 border border-foreground/10 rounded-3xl p-5 backdrop-blur-md space-y-4">
							<div className="flex items-center gap-2 border-b border-foreground/10 pb-3">
								<h3 className="text-sm font-semibold tracking-wide uppercase text-slate-400">
									User Details
								</h3>
							</div>

							<div className="space-y-3.5">
								{/* Meta Row: Email */}
								<div className="flex items-center gap-3 text-slate-300">
									<div className="p-2 rounded-lg bg-slate-950/40 border border-foreground/5 text-slate-400">
										<Calendar className="w-4 h-4" />
									</div>
									<div>
										<p className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">
											Last Active
										</p>
										<p className="text-xs font-medium">
											{user.status === UserStatus.ONLINE
												? "Active Now"
												: formatLastSeen(user.lastSeen)}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
