"use client";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
	conversationsApi,
	useGetAllConversationsQuery,
} from "@/store/api/conversations";
import { ConversationType, Message, User, UserStatus } from "@/types";
import { memo, useEffect, useMemo, useState } from "react";
import { Input } from "./ui/input";
import {
	MessageSquare,
	MessageSquarePlus,
	RefreshCw,
	Search,
} from "lucide-react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { setConversations } from "@/store/features/conversationsSlice";
import { useSocket } from "./SocketContext";
import { useParams } from "next/navigation";
import { CreateGroupModal } from "./CreateGroupModal";
import { ConversationsSidebarList } from "./ConversationsSidebarList";
import Link from "next/link";

export const ConversationsSidebar = memo(() => {
	const { data, isError, isLoading, isFetching, refetch } =
		useGetAllConversationsQuery();
	const dispatch = useAppDispatch();
	const { socket } = useSocket();
	const { conversationId } = useParams();
	const isConversationOpen = Boolean(conversationId);
	const [search, setSearch] = useState("");
	const currentUser = useAppSelector((state) => state.user.user);

	useEffect(() => {
		dispatch(setConversations(data || []));
	}, [data, dispatch]);

	const filteredConversations = useMemo(
		() =>
			data?.filter((c) => {
				const otherUser = (
					c.type == ConversationType.PRIVATE
						? c.participants.find((p) => (p as User)._id != currentUser?._id)
						: null
				) as User | null;
				return (
					otherUser?.username.toLowerCase().includes(search.toLowerCase()) ||
					otherUser?.name.toLowerCase().includes(search.toLowerCase()) ||
					c.groupName?.toLowerCase().includes(search.toLowerCase())
				);
			}),
		[currentUser?._id, data, search],
	);

	useEffect(() => {
		if (!socket) return;
		const handleStatusChange = (data: {
			userId: string;
			status: UserStatus;
			lastSeen: string;
		}) => {
			dispatch(
				conversationsApi.util.updateQueryData(
					"getAllConversations",
					undefined,
					(draft) => {
						const conversationIndex = draft.findIndex(
							(c) =>
								c.type == ConversationType.PRIVATE &&
								c.participants.some((p) => (p as User)._id == data.userId),
						);
						const participantIndex =
							conversationIndex !== -1
								? draft[conversationIndex].participants.findIndex(
										(p) => (p as User)._id == data.userId,
									)
								: -1;

						if (conversationIndex !== -1 && participantIndex !== -1)
							draft[conversationIndex].participants[participantIndex] = {
								...(draft[conversationIndex].participants[
									participantIndex
								] as User),
								status: data.status,
							};
					},
				),
			);
		};

		const handleNewMessage = (message: Message) => {
			dispatch(
				conversationsApi.util.updateQueryData(
					"getAllConversations",
					undefined,
					(draft) => {
						const conversationIndex = draft.findIndex(
							(c) => c._id === message.conversationId,
						);
						if (conversationIndex !== -1) {
							draft[conversationIndex].lastMessage = message;
							if (conversationId !== message.conversationId) {
								draft[conversationIndex].participantsMetadata[0].unreadCount +=
									1;
							}
							draft.sort(
								(a, b) =>
									new Date(
										(b.lastMessage as Message)?.createdAt || 0,
									).getTime() -
									new Date(
										(a.lastMessage as Message)?.createdAt || 0,
									).getTime(),
							);
						}
					},
				),
			);
		};

		const handleUpdatedMessage = (message: Message) => {
			dispatch(
				conversationsApi.util.updateQueryData(
					"getAllConversations",
					undefined,
					(draft) => {
						const conversation = draft.find(
							(item) => item._id === String(message.conversationId),
						);
						const lastMessage = conversation?.lastMessage as
							| Message
							| undefined;

						if (conversation && lastMessage?._id === message._id) {
							conversation.lastMessage = {
								...lastMessage,
								...message,
							};
						}
					},
				),
			);
		};

		const handleRemovedMessage = () => {
			void refetch();
		};

		const handleJoinConversation = ({
			conversationId,
		}: {
			conversationId: string;
		}) => {
			dispatch(
				conversationsApi.util.updateQueryData(
					"getAllConversations",
					undefined,
					(draft) => {
						const conversationIndex = draft.findIndex(
							(c) => c._id == conversationId,
						);
						if (conversationIndex !== -1) {
							draft[conversationIndex].participantsMetadata[0].unreadCount = 0;
							draft[
								conversationIndex
							].participantsMetadata[0].lastReadMessageId =
								(draft[conversationIndex].lastMessage as Message)?._id || null;
						}
					},
				),
			);
		};

		socket.on("conversation.join", handleJoinConversation);
		socket.on("user.status.changed", handleStatusChange);
		socket.on("message.new", handleNewMessage);
		socket.on("message.updated", handleUpdatedMessage);
		socket.on("message.removed", handleRemovedMessage);
		return () => {
			socket.off("message.new", handleNewMessage);
			socket.off("message.updated", handleUpdatedMessage);
			socket.off("message.removed", handleRemovedMessage);
			socket.off("user.status.changed", handleStatusChange);
			socket.off("conversation.join", handleJoinConversation);
		};
	}, [conversationId, dispatch, refetch, socket]);

	return (
		<aside
			className={`${isConversationOpen ? "hidden md:flex" : "flex"} h-[calc(100dvh-4rem)] w-full min-w-0 shrink-0 flex-col gap-4 overflow-hidden border-b border-foreground/10 bg-sidebar py-4 md:h-dvh md:w-75 md:border-b-0 md:border-r`}
		>
			<header className="flex items-center justify-between gap-4 px-4">
				<h1 className="text-2xl font-semibold">Chats</h1>
				<CreateGroupModal>
					<Button>
						<MessageSquarePlus />
					</Button>
				</CreateGroupModal>
			</header>
			<div className="relative px-4">
				<Search
					className="absolute top-1/2 -translate-y-1/2 left-8 text-sidebar-foreground/60"
					size={22}
				/>
				<Input
					className="rounded-full border border-foreground/10 bg-sidebar-foreground/15 pl-12 py-2 text-sm text-slate-400"
					placeholder="Search Conversations"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			</div>
			{isLoading ? (
				<div className="space-y-2 px-4" aria-label="Loading conversations">
					{Array.from({ length: 4 }).map((_, index) => (
						<div
							key={index}
							className="flex items-center gap-3 rounded-2xl px-3 py-4"
						>
							<Skeleton className="h-11 w-11 rounded-full" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-3 w-2/3" />
								<Skeleton className="h-3 w-full" />
							</div>
						</div>
					))}
				</div>
			) : isError ? (
				<div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
					<p className="text-sm text-muted-foreground">
						Couldn&apos;t load conversations.
					</p>
					<Button
						size="sm"
						variant="outline"
						onClick={() => refetch()}
						disabled={isFetching}
					>
						<RefreshCw className={isFetching ? "animate-spin" : ""} />
						{isFetching ? "Retrying..." : "Try again"}
					</Button>
				</div>
			) : !data?.length || !filteredConversations?.length ? (
				<div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
					<div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-foreground/10 bg-sidebar-foreground/10 text-muted-foreground">
						<MessageSquare className="size-5" />
					</div>
					<div className="space-y-1">
						<h2 className="text-sm font-semibold">
							{data?.length ? "No conversations found" : "No conversations yet"}
						</h2>
						<p className="text-xs text-muted-foreground">
							{data?.length ? (
								"Try a different search."
							) : (
								<Link href="/search" className="underline text-xs">
									Go get some friends and start a conversation
								</Link>
							)}
						</p>
					</div>
				</div>
			) : (
				<ConversationsSidebarList conversations={filteredConversations} />
			)}
		</aside>
	);
});

ConversationsSidebar.displayName = "ConversationsSidebar";
