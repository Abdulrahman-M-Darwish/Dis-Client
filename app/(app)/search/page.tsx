"use client";

import { memo, use, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CircleAlert, CircleCheck, CircleX, Search, Users } from "lucide-react";
import { useLazySearchUsersQuery, usersApi } from "@/store/api/users";
import Link from "next/link";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useRouter } from "next/navigation";
import { AddFriendButton } from "./AddFriendButton";
import { CancelButton } from "./CancelButton";
import { AcceptButton } from "./AcceptButton";
import { DeclineButton } from "./DeclineButton";
import { UnfriendButton } from "./UnfriendButton";
import { useSocket } from "@/components/SocketContext";

export type FriendSocketUpdate = {
	userId: string;
	relationship: "NONE" | "SENT_PENDING" | "RECEIVED_PENDING" | "FRIEND";
	requestId?: string;
};

const UserSearchPage = memo(
	({ searchParams }: { searchParams: Promise<{ q?: string }> }) => {
		const [searchUsers, { isLoading, data, error, isUninitialized }] =
			useLazySearchUsersQuery();
		const currentUser = useAppSelector((state) => state.user.user);
		const router = useRouter();
		const params = use(searchParams);
		const { socket } = useSocket();
		const dispatch = useAppDispatch();

		const [searchQuery, setSearchQuery] = useState(params.q || "");

		const handleSubmit = useCallback(
			async (event: React.SubmitEvent | void) => {
				event?.preventDefault();
				if (!searchQuery.trim()) return;
				const params = new URLSearchParams();
				params.set("q", searchQuery);
				router.replace("/search?" + params.toString());
				await searchUsers(`?search=${searchQuery}`);
			},
			[router, searchQuery, searchUsers],
		);

		useEffect(() => {
			const initialQuery = params.q?.trim();
			if (initialQuery) void searchUsers(`?search=${initialQuery}`);
		}, [params.q, searchParams, searchUsers]);

		useEffect(() => {
			if (!socket) return;

			const handleFriendUpdate = (data: FriendSocketUpdate) => {
				dispatch(
					usersApi.util.updateQueryData(
						"searchUsers",
						`?search=${params.q}`,
						(draft) => {
							const userIndex = draft.findIndex((u) => u._id == data.userId);
							if (userIndex == -1) return;
							draft[userIndex].requestId = data.requestId;
							draft[userIndex].relationship = data.relationship;
						},
					),
				);
			};

			socket.on("friend.request.send", handleFriendUpdate);
			socket.on("friend.request.accept", handleFriendUpdate);
			socket.on("friend.request.cancel", handleFriendUpdate);
			socket.on("friend.request.unfriend", handleFriendUpdate);

			return () => {
				socket.off("friend.request.send", handleFriendUpdate);
				socket.off("friend.request.accept", handleFriendUpdate);
				socket.off("friend.request.cancel", handleFriendUpdate);
				socket.off("friend.request.unfriend", handleFriendUpdate);
			};
		}, [dispatch, params.q, searchParams, socket]);

		return (
			<div className="flex-1 flex flex-col min-h-screen bg-slate-950 bg-[radial-gradient(circle_at_top_left,var(--primary),transparent_25%)] text-slate-100 p-4 sm:p-6 md:p-8">
				<div className="max-w-4xl mx-auto w-full space-y-6">
					{/* Header Block */}
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
								<Users className="w-5 h-5" />
							</div>
							<div>
								<h1 className="text-xl font-bold tracking-tight">
									Find Friends
								</h1>
								<p className="text-xs text-muted-foreground">
									Find friends and global users by name, display name, or bio
								</p>
							</div>
						</div>
					</div>

					<div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-slate-900/60 border border-foreground/10 rounded-2xl p-3 backdrop-blur-xl">
						<form
							onSubmit={handleSubmit}
							className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-foreground/5 bg-slate-950/40 text-slate-400 focus-within:border-primary/50 transition"
						>
							<input
								type="text"
								placeholder="Search by name, handle, or status..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="flex-1 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500 w-full"
								disabled={isLoading}
							/>
							{searchQuery && !isLoading && (
								<button
									type="button"
									onClick={() => setSearchQuery("")}
									className="hover:text-rose-400 transition"
								>
									<CircleX className="w-4 h-4" />
								</button>
							)}
							<Button
								type="submit"
								disabled={isLoading || !searchQuery.trim()}
								className="rounded-full w-8 h-8"
							>
								<Search className="w-4 h-4" strokeWidth={2} />
							</Button>
						</form>
					</div>

					{/* Error Notification Banner */}
					{error && (
						<div className="flex items-start gap-3 p-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-200 backdrop-blur-md">
							<CircleAlert className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
							<div className="space-y-1">
								<h4 className="text-sm font-semibold">Something went wrong</h4>
								<p className="text-xs text-rose-300/80">
									We {"couldn't"} fetch the directory results. Please verify
									your connection or try again shortly.
								</p>
							</div>
						</div>
					)}

					{/* Results Container */}
					<div className="bg-slate-900/40 border border-foreground/10 rounded-3xl overflow-hidden backdrop-blur-md">
						<div className="p-4 border-b border-foreground/10 bg-slate-950/20 flex justify-between items-center">
							<span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
								{isLoading
									? "Fetching users..."
									: `Matching Users (${data?.length || 0})`}
							</span>
						</div>

						{/* 1. Initial State (Before searching) */}
						{isUninitialized && !isLoading && !error && (
							<div className="py-16 px-4 text-center">
								<div className="mx-auto w-12 h-12 rounded-2xl bg-slate-900 border border-foreground/10 flex items-center justify-center mb-3 text-slate-400">
									<CircleAlert className="w-5 h-5" />
								</div>
								<h3 className="text-sm font-semibold text-slate-300">
									Ready to search
								</h3>
								<p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
									Enter a username, handles, or keywords above to discover
									people.
								</p>
							</div>
						)}

						{/* 2. Loading State Skeletons */}
						{isLoading && (
							<div className="divide-y divide-foreground/10 animate-pulse">
								{[...Array(3)].map((_, index) => (
									<div
										key={index}
										className="flex flex-col sm:flex-row sm:items-center gap-4 p-4"
									>
										<div className="flex items-center gap-3.5 flex-1">
											<div className="h-12 w-12 rounded-2xl bg-slate-800/60 shrink-0" />
											<div className="space-y-2 flex-1">
												<div className="flex items-center gap-2">
													<div className="h-4 bg-slate-800/60 rounded w-24" />
													<div className="h-3 bg-slate-800/40 rounded w-16" />
												</div>
												<div className="h-3 bg-slate-800/40 rounded w-1/2" />
											</div>
										</div>
										<div className="flex gap-2 w-full sm:w-auto">
											<div className="h-9 bg-slate-800/50 rounded-xl w-full sm:w-28" />
											<div className="h-9 bg-slate-800/50 rounded-xl w-full sm:w-24" />
										</div>
									</div>
								))}
							</div>
						)}

						{/* 3. Successful Data Render */}
						{!isLoading && data && data.length > 0 && (
							<div className="divide-y divide-foreground/10">
								{data.map((user) => (
									<div
										key={user._id}
										className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 transition duration-200 hover:bg-sidebar-accent/10"
									>
										{/* Left Side: Avatar with Status Indicator Ring */}
										<div className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer">
											<Link href={"/profile/" + user._id}>
												{user.avatarUrl ? (
													<Image
														width={48}
														height={48}
														src={user.avatarUrl}
														alt={user.name}
														className="rounded-2xl h-12 w-12"
													/>
												) : (
													<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-300 font-bold text-slate-950 text-lg shadow-md">
														{user.username?.charAt(0).toUpperCase()}
													</div>
												)}
											</Link>

											<div className="min-w-0">
												<Link
													href={"/profile/" + user._id}
													className="flex items-center gap-2"
												>
													<h3 className="text-sm font-bold text-slate-100 truncate hover:underline cursor-pointer">
														{user.username}
													</h3>
													<span className="text-xs text-slate-500 truncate hover:underline cursor-pointer">
														@{user.name}
														{user._id == currentUser?._id && (
															<span className="text-primary text-xs">
																{" "}
																(YOU)
															</span>
														)}
													</span>
												</Link>
												{user.bio && (
													<p className="text-xs text-slate-400 mt-0.5 truncate italic">
														{user.bio}
													</p>
												)}
											</div>
										</div>

										{/* Right Side: Quick Action Buttons */}
										<div className="flex items-center gap-2 sm:self-center">
											<AddFriendButton
												userId={user._id}
												relationship={user.relationship}
											/>
											<CancelButton
												relationship={user.relationship}
												requestId={user.requestId}
											/>
											<DeclineButton
												relationship={user.relationship}
												requestId={user.requestId}
											/>
											<UnfriendButton
												relationship={user.relationship}
												userId={user._id}
											/>
											<AcceptButton
												relationship={user.relationship}
												requestId={user.requestId}
											/>
										</div>
									</div>
								))}
							</div>
						)}

						{/* 4. No Results Found State */}
						{!isLoading &&
							!isUninitialized &&
							!error &&
							(!data || data.length === 0) && (
								<div className="py-12 px-4 text-center">
									<div className="mx-auto w-12 h-12 rounded-2xl bg-slate-900 border border-foreground/10 flex items-center justify-center mb-3">
										<CircleCheck className="w-5 h-5 text-slate-500" />
									</div>
									<h3 className="text-sm font-semibold text-slate-300">
										No users found
									</h3>
									<p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
										Try refining your search query or switching your active
										directory filters.
									</p>
								</div>
							)}
					</div>
				</div>
			</div>
		);
	},
);

UserSearchPage.displayName = "UserSearchPage";

export default UserSearchPage;
