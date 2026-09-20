"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
	useGetFriendsQuery,
	useGetPendingRequestsQuery,
} from "@/store/api/friends";
import { useAppSelector } from "@/hooks";
import { FriendRequest, User } from "@/types";
import { UnfriendButton } from "../search/UnfriendButton";
import { AcceptButton } from "../search/AcceptButton";
import { DeclineButton } from "../search/DeclineButton";
import { CancelButton } from "../search/CancelButton";
import {
	CircleAlert,
	CircleX,
	Mail,
	MessageCircle,
	Search,
	Send,
	UserCheck,
	Users,
} from "lucide-react";
const getPopulatedUser = (value: string | User): User | undefined =>
	typeof value === "string" ? undefined : value;

type TabType = "all" | "incoming" | "outgoing";

export default function FriendsPage() {
	const [activeTab, setActiveTab] = useState<TabType>("all");
	const [searchQuery, setSearchQuery] = useState("");

	const currentUser = useAppSelector((state) => state.user.user);

	// RTK Query Hooks
	const {
		data: friendsData,
		isLoading: isLoadingFriends,
		error: friendsError,
	} = useGetFriendsQuery();

	const {
		data: pendingData,
		isLoading: isLoadingPending,
		error: pendingError,
	} = useGetPendingRequestsQuery();

	// Normalization logic depending on backend response shape
	const friends = useMemo(() => friendsData || [], [friendsData]);
	const incomingRequests = useMemo(
		() => pendingData?.incoming || [],
		[pendingData],
	);
	const outgoingRequests = useMemo(
		() => pendingData?.outgoing || [],
		[pendingData],
	);

	// Local Filter
	const filteredList = useMemo(() => {
		const q = searchQuery.toLowerCase().trim();

		if (activeTab === "all") {
			return friends.filter(
				(user: User) =>
					user.username?.toLowerCase().includes(q) ||
					user.name?.toLowerCase().includes(q),
			);
		}

		if (activeTab === "incoming") {
			return incomingRequests.filter((req: FriendRequest) => {
				const sender = getPopulatedUser(req.sender);
				return (
					sender?.username?.toLowerCase().includes(q) ||
					sender?.name?.toLowerCase().includes(q)
				);
			});
		}

		if (activeTab === "outgoing") {
			return outgoingRequests.filter((req: FriendRequest) => {
				const receiver = getPopulatedUser(req.receiver);
				return (
					receiver?.username?.toLowerCase().includes(q) ||
					receiver?.name?.toLowerCase().includes(q)
				);
			});
		}

		return [];
	}, [searchQuery, activeTab, friends, incomingRequests, outgoingRequests]);

	const isLoading = isLoadingFriends || isLoadingPending;
	const hasError = friendsError || pendingError;

	return (
		<div className="flex-1 flex flex-col min-h-screen bg-slate-950 bg-[radial-gradient(circle_at_top_left,var(--primary),transparent_25%)] text-slate-100 p-4 sm:p-6 md:p-8">
			<div className="max-w-4xl mx-auto w-full space-y-6">
				{/* Header Section */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
							<Users className="w-5 h-5" />
						</div>
						<div>
							<h1 className="text-xl font-bold tracking-tight">
								Friends & Connections
							</h1>
							<p className="text-xs text-muted-foreground">
								Manage your friendships, incoming invites, and sent requests
							</p>
						</div>
					</div>
				</div>

				{/* Navigation Tabs & Search Controls */}
				<div className="flex flex-col gap-4 bg-slate-900/60 border border-foreground/10 rounded-2xl p-3 backdrop-blur-xl">
					<div className="flex items-center gap-2 border-b border-foreground/10 pb-3 overflow-x-auto scrollbar-none">
						<button
							onClick={() => setActiveTab("all")}
							className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer shrink-0 ${
								activeTab === "all"
									? "bg-primary text-primary-foreground shadow-sm"
									: "bg-slate-950/40 text-slate-400 hover:text-slate-200 border border-foreground/5"
							}`}
						>
							<UserCheck className="w-4 h-4" />
							All Friends ({friends.length})
						</button>

						<button
							onClick={() => setActiveTab("incoming")}
							className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer shrink-0 ${
								activeTab === "incoming"
									? "bg-primary text-primary-foreground shadow-sm"
									: "bg-slate-950/40 text-slate-400 hover:text-slate-200 border border-foreground/5"
							}`}
						>
							<Mail className="w-4 h-4" />
							Pending Received ({incomingRequests.length})
							{incomingRequests.length > 0 && (
								<span className="ml-1 rounded-full bg-rose-500 text-white text-[10px] px-1.5 py-0.2 font-bold">
									{incomingRequests.length}
								</span>
							)}
						</button>

						<button
							onClick={() => setActiveTab("outgoing")}
							className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer shrink-0 ${
								activeTab === "outgoing"
									? "bg-primary text-primary-foreground shadow-sm"
									: "bg-slate-950/40 text-slate-400 hover:text-slate-200 border border-foreground/5"
							}`}
						>
							<Send className="w-4 h-4" />
							Pending Sent ({outgoingRequests.length})
						</button>
					</div>

					{/* Search Input Filter */}
					<div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-foreground/5 bg-slate-950/40 text-slate-400 focus-within:border-primary/50 transition">
						<Search className="w-4 h-4 text-slate-500" />
						<input
							type="text"
							placeholder={`Filter ${activeTab} list by name or username...`}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="flex-1 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500 w-full"
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="hover:text-rose-400 transition"
							>
								<CircleX className="w-4 h-4" />
							</button>
						)}
					</div>
				</div>

				{/* Error Notification Banner */}
				{hasError && (
					<div className="flex items-start gap-3 p-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-200 backdrop-blur-md">
						<CircleAlert className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
						<div className="space-y-1">
							<h4 className="text-sm font-semibold">Unable to load data</h4>
							<p className="text-xs text-rose-300/80">
								We {"couldn't"} retrieve your friend list or pending requests.
								Please check your connection.
							</p>
						</div>
					</div>
				)}

				{/* Content Container */}
				<div className="bg-slate-900/40 border border-foreground/10 rounded-3xl overflow-hidden backdrop-blur-md">
					<div className="p-4 border-b border-foreground/10 bg-slate-950/20 flex justify-between items-center">
						<span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
							{isLoading
								? "Loading list..."
								: `${activeTab.toUpperCase()} (${filteredList.length})`}
						</span>
					</div>

					{/* Loading Skeletons */}
					{isLoading && (
						<div className="divide-y divide-foreground/10 animate-pulse">
							{[...Array(4)].map((_, index) => (
								<div key={index} className="flex items-center gap-4 p-4">
									<div className="h-12 w-12 rounded-2xl bg-slate-800/60 shrink-0" />
									<div className="space-y-2 flex-1">
										<div className="h-4 bg-slate-800/60 rounded w-28" />
										<div className="h-3 bg-slate-800/40 rounded w-16" />
									</div>
									<div className="h-9 bg-slate-800/50 rounded-xl w-24" />
								</div>
							))}
						</div>
					)}

					{/* List Data View */}
					{!isLoading && filteredList.length > 0 && (
						<div className="divide-y divide-foreground/10">
							{filteredList.map((item) => {
								// Parse user based on tab context
								const pendingItem = item as FriendRequest;
								const targetUser = (
									activeTab === "all"
										? item
										: activeTab === "incoming"
											? (pendingItem.sender as User)
											: (pendingItem.receiver as User)
								) as User;

								const requestId =
									activeTab === "all" ? undefined : (item as FriendRequest)._id;

								return (
									<div
										key={item._id || targetUser?._id}
										className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 transition duration-200 hover:bg-slate-800/20"
									>
										{/* User Profile Overview */}
										<div className="flex items-center gap-3.5 flex-1 min-w-0">
											<Link href={`/profile/${targetUser?._id}`}>
												{targetUser?.avatarUrl ? (
													<Image
														width={48}
														height={48}
														src={targetUser.avatarUrl}
														alt={targetUser.username || "User"}
														className="rounded-2xl h-12 w-12 object-cover"
													/>
												) : (
													<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-500/30 font-bold text-indigo-300 text-lg shadow-md shrink-0">
														{targetUser?.username?.charAt(0).toUpperCase() ||
															"?"}
													</div>
												)}
											</Link>

											<div className="min-w-0">
												<Link
													href={`/profile/${targetUser?._id}`}
													className="flex items-center gap-2"
												>
													<h3 className="text-sm font-bold text-slate-100 truncate hover:underline cursor-pointer">
														{targetUser?.username}
													</h3>
													<span className="text-xs text-slate-500 truncate">
														@{targetUser?.name}
														{targetUser?._id === currentUser?._id && (
															<span className="text-primary text-xs">
																{" "}
																(YOU)
															</span>
														)}
													</span>
												</Link>
												{targetUser?.bio && (
													<p className="text-xs text-slate-400 mt-0.5 truncate italic">
														{targetUser.bio}
													</p>
												)}
											</div>
										</div>

										{/* Quick Contextual Action Buttons */}
										<div className="flex items-center gap-2 self-end sm:self-center">
											{/* TAB 1: ALL FRIENDS */}
											{activeTab === "all" && (
												<>
													<Link href={`/${targetUser?._id}`}>
														<Button
															size="sm"
															className="rounded-xl bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-xs gap-1.5 h-9 px-3 cursor-pointer"
														>
															<MessageCircle className="w-4 h-4" />
															Message
														</Button>
													</Link>
													<UnfriendButton
														relationship="FRIEND"
														userId={targetUser._id}
													/>
												</>
											)}

											{/* TAB 2: INCOMING REQUESTS */}
											{activeTab === "incoming" && (
												<>
													<AcceptButton
														relationship="RECEIVED_PENDING"
														requestId={requestId}
													/>
													<DeclineButton
														relationship="RECEIVED_PENDING"
														requestId={requestId}
													/>
												</>
											)}

											{/* TAB 3: OUTGOING REQUESTS */}
											{activeTab === "outgoing" && (
												<CancelButton
													relationship="SENT_PENDING"
													requestId={requestId}
												/>
											)}
										</div>
									</div>
								);
							})}
						</div>
					)}

					{/* Empty State */}
					{!isLoading && filteredList.length === 0 && (
						<div className="py-16 px-4 text-center">
							<div className="mx-auto w-12 h-12 rounded-2xl bg-slate-900 border border-foreground/10 flex items-center justify-center mb-3 text-slate-500">
								<Users className="w-6 h-6" />
							</div>
							<h3 className="text-sm font-semibold text-slate-300">
								No People found :(
							</h3>
							<p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
								{searchQuery
									? "No results match your search term."
									: `You currently have no one in your ${activeTab} list.`}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
