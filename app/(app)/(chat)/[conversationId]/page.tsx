"use client";
import { useSocket } from "@/components/SocketContext";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
	messagesApi,
	useGetAllMessagesQuery,
	useLazyGetAllMessagesQuery,
} from "@/store/api/messages";
import { useGetAllConversationsQuery } from "@/store/api/conversations";
import { Message, User } from "@/types";
import React, {
	memo,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { ConversationForm } from "./ConversationForm";
import { ConversationHeader } from "./ConversationHeader";
import { ConversationReplyWidget } from "./ConversationReplyWidget";
import { ConversationMessage } from "./ConversationMessage";
import { GroupInfoSidebar } from "./GroupInfoSidebar";
import { EditGroupInfoSidebar } from "./EditGroupInfoSidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FaceSlightlyFrowning, RefreshCw } from "lucide-react";

const isSameCalendarDay = (first: Date, second: Date) =>
	first.getFullYear() === second.getFullYear() &&
	first.getMonth() === second.getMonth() &&
	first.getDate() === second.getDate();

const getDateDividerLabel = (value: string | Date) => {
	const messageDate = new Date(value);
	const today = new Date();
	const yesterday = new Date();
	yesterday.setDate(today.getDate() - 1);

	if (isSameCalendarDay(messageDate, today)) return "Today";
	if (isSameCalendarDay(messageDate, yesterday)) return "Yesterday";

	return messageDate.toLocaleDateString(undefined, {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
};

const Conversation = memo(
	({ params }: { params: Promise<{ conversationId: string }> }) => {
		const { conversationId } = React.use(params);
		const inputRef = useRef<HTMLInputElement>(null);
		const messagesContainerDev = useRef<HTMLDivElement | null>(null);

		const prevScrollHeightRef = useRef<number>(0);
		const isPrependingRef = useRef<boolean>(false);
		const initialScrollConversationRef = useRef<string | null>(null);
		const [hasMore, setHasMore] = useState<boolean>(true);

		const [replyMessage, setReplyMessage] = useState<Message | null>(null);
		const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
		const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
		const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);

		const currentUser = useAppSelector((state) => state.user.user);
		const {
			data: conversationData,
			isError: isConversationsError,
			isFetching: isConversationsFetching,
			isLoading: isConversationsLoading,
			refetch: refetchConversations,
		} = useGetAllConversationsQuery();
		const conversation = useMemo(
			() => conversationData?.find((c) => c._id === conversationId),
			[conversationData, conversationId],
		);
		const clearedMessageId =
			conversation?.participantsMetadata[0].clearedMessageId;
		const {
			data: messages,
			isError: isMessagesError,
			isLoading: isMessagesLoading,
			isFetching: isMessagesFetching,
			refetch: refetchMessages,
		} = useGetAllMessagesQuery({
			conversationId,
			...(clearedMessageId ? { clearedMessageId: clearedMessageId } : {}),
		});
		const [triggerFetchOlder, { isFetching: isFetchingOlder }] =
			useLazyGetAllMessagesQuery();
		const isPrivate = conversation?.type === "PRIVATE";
		const otherUser = isPrivate
			? (conversation?.participants as User[])?.find(
					(p) => p._id !== currentUser?._id,
				)
			: null;
		const typingNames = useMemo(
			() =>
				Object.keys(typingUsers).map(
					(userId) =>
						(
							conversation?.participants.find(
								(participant) => (participant as User)._id === userId,
							) as User
						)?.username,
				),
			[conversation?.participants, typingUsers],
		);

		const { socket } = useSocket();
		const dispatch = useAppDispatch();

		const loadOlderMessages = useCallback(async () => {
			if (!messages || messages.length === 0 || isFetchingOlder || !hasMore)
				return;

			const oldestMessageId = messages[0]._id;

			// Save scroll height right before fetching new items
			if (messagesContainerDev.current) {
				prevScrollHeightRef.current = messagesContainerDev.current.scrollHeight;
				isPrependingRef.current = true;
			}

			try {
				const result = await triggerFetchOlder({
					conversationId,
					beforeMessageId: oldestMessageId,
					...(clearedMessageId ? { clearedMessageId: clearedMessageId } : {}),
				}).unwrap();
				if (!result || result.length === 0) {
					setHasMore(false);
					isPrependingRef.current = false;
					return;
				}
				dispatch(
					messagesApi.util.updateQueryData(
						"getAllMessages",
						{ conversationId },
						(draft) => {
							draft.unshift(...result);
						},
					),
				);
			} catch (err) {
				console.error("Failed to load older messages", err);
				isPrependingRef.current = false;
			}
		}, [
			clearedMessageId,
			conversationId,
			dispatch,
			hasMore,
			isFetchingOlder,
			messages,
			triggerFetchOlder,
		]);

		const observerRef = useRef<IntersectionObserver | null>(null);
		const topSentinelRef = useCallback(
			(node: HTMLDivElement | null) => {
				// Clean up previous observer instance
				if (observerRef.current) {
					observerRef.current.disconnect();
				}
				if (node && hasMore && !isFetchingOlder) {
					observerRef.current = new IntersectionObserver(
						(entries) => {
							if (entries[0].isIntersecting) {
								loadOlderMessages();
							}
						},
						{
							root: messagesContainerDev.current, // Constrain to scroll container
							threshold: 0.1,
						},
					);

					observerRef.current.observe(node);
				}
			},
			[hasMore, isFetchingOlder, loadOlderMessages],
		);

		useLayoutEffect(() => {
			if (isPrependingRef.current && messagesContainerDev.current) {
				const container = messagesContainerDev.current;
				const newScrollHeight = container.scrollHeight;

				// Adjust scroll position to hold user view steady
				container.scrollTop = newScrollHeight - prevScrollHeightRef.current;
				isPrependingRef.current = false;
			}
		}, [messages]);

		useLayoutEffect(() => {
			if (
				isMessagesLoading ||
				isMessagesFetching ||
				!messages ||
				initialScrollConversationRef.current === conversationId
			) {
				return;
			}

			const container = messagesContainerDev.current;
			if (!container) return;

			initialScrollConversationRef.current = conversationId;
			container.scrollTop = container.scrollHeight;
		}, [conversationId, isMessagesFetching, isMessagesLoading, messages]);

		useEffect(() => {
			if (!socket || !conversationId) return;
			socket.emit("conversation.join", conversationId);

			const handleNewMessage = (newMessage: Message) => {
				if (String(newMessage.conversationId) === String(conversationId)) {
					dispatch(
						messagesApi.util.updateQueryData(
							"getAllMessages",
							{ conversationId },
							(draft) => {
								const exists = draft.some(
									(msg) => String(msg._id) === String(newMessage._id),
								);
								if (!exists) {
									draft.push(newMessage);
								}
							},
						),
					);
					if (!messagesContainerDev.current) return;
					const isNearBottom =
						messagesContainerDev.current.scrollHeight -
							messagesContainerDev.current.scrollTop -
							messagesContainerDev.current.clientHeight <=
						200;

					if (isNearBottom || newMessage.senderId === currentUser?._id) {
						requestAnimationFrame(() => {
							if (messagesContainerDev.current) {
								messagesContainerDev.current.scroll({
									top: 99999999,
								});
							}
						});
					}
				}
			};

			const handleUpdateMessage = (updatedMessage: Message) => {
				if (String(updatedMessage.conversationId) === String(conversationId)) {
					dispatch(
						messagesApi.util.updateQueryData(
							"getAllMessages",
							{ conversationId },
							(draft) => {
								const index = draft.findIndex(
									(msg) => String(msg._id) === String(updatedMessage._id),
								);
								if (index !== -1) {
									draft[index] = { ...draft[index], ...updatedMessage };
								}
							},
						),
					);
				}
			};

			const handleDeleteMessage = ({
				_id,
				conversationId: msgConversationId,
			}: {
				_id: string;
				conversationId: string;
			}) => {
				if (String(msgConversationId) === String(conversationId)) {
					dispatch(
						messagesApi.util.updateQueryData(
							"getAllMessages",
							{ conversationId },
							(draft) => {
								const index = draft.findIndex(
									(msg) => String(msg._id) === String(_id),
								);
								if (index !== -1) {
									draft.splice(index, 1);
								}
							},
						),
					);
				}
			};

			const handleTyping = ({
				conversationId: typingConversationId,
				userId,
			}: {
				conversationId: string;
				userId: string;
			}) => {
				if (String(typingConversationId) !== String(conversationId)) return;
				setTypingUsers((users) => ({ ...users, [userId]: true }));
			};

			const handleStopTyping = ({
				conversationId: typingConversationId,
				userId,
			}: {
				conversationId: string;
				userId: string;
			}) => {
				if (String(typingConversationId) !== String(conversationId)) return;
				setTypingUsers((users) => {
					const nextUsers = { ...users };
					delete nextUsers[userId];
					return nextUsers;
				});
			};

			socket.on("message.new", handleNewMessage);
			socket.on("message.updated", handleUpdateMessage);
			socket.on("message.removed", handleDeleteMessage);
			socket.on("conversation.typing", handleTyping);
			socket.on("conversation.stopTyping", handleStopTyping);

			return () => {
				socket.off("message.new", handleNewMessage);
				socket.off("message.updated", handleUpdateMessage);
				socket.off("message.removed", handleDeleteMessage);
				socket.off("conversation.typing", handleTyping);
				socket.off("conversation.stopTyping", handleStopTyping);
				socket.emit("conversation.leave", conversationId);
				setTypingUsers({});
			};
		}, [conversationId, currentUser?._id, dispatch, socket]);
		if (!currentUser)
			return (
				<main className="flex-1 h-screen flex flex-col min-w-0 bg-[#0f171c] relative">
					loading
				</main>
			);
		if (isConversationsLoading)
			return (
				<main className="flex-1 h-screen flex flex-col min-w-0 bg-[#0f171c]">
					<div className="border-b border-slate-800 px-6 py-4">
						<Skeleton className="h-11 w-11 rounded-full" />
					</div>
					<div className="flex-1 space-y-6 p-6">
						<Skeleton className="h-12 w-2/3 rounded-2xl" />
						<Skeleton className="ml-auto h-16 w-1/2 rounded-2xl" />
						<Skeleton className="h-10 w-1/3 rounded-2xl" />
					</div>
				</main>
			);
		if (isConversationsError)
			return (
				<main className="flex-1 h-screen flex items-center justify-center bg-[#0f171c] p-6 text-center">
					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							Couldn&apos;t load this conversation
						</h2>
						<p className="text-sm text-slate-400">
							Check your connection and try again.
						</p>
						<Button onClick={() => refetchConversations()} variant="outline">
							<RefreshCw />
							Try again
						</Button>
					</div>
				</main>
			);
		if (!conversation)
			return (
				<main className="flex-1 h-screen flex items-center justify-center bg-[#0f171c] p-6 text-center">
					<div className="space-y-2">
						<h2 className="text-lg font-semibold text-slate-100">
							Conversation not found
						</h2>
						<p className="text-sm text-slate-400">
							It may have been deleted or you may not have access to it.
						</p>
						<Button
							variant="outline"
							onClick={() => refetchConversations()}
							disabled={isConversationsFetching}
						>
							<RefreshCw
								className={isConversationsFetching ? "animate-spin" : ""}
							/>
							{isConversationsFetching ? "Checking..." : "Check again"}
						</Button>
					</div>
				</main>
			);

		return (
			<main className="flex-1 h-screen flex flex-col min-w-0 bg-[#0f171c] relative">
				{conversation && (
					<ConversationHeader
						conversation={conversation}
						isPrivate={isPrivate}
						otherUser={otherUser}
						setIsEditGroupOpen={setIsEditGroupOpen}
						setIsGroupInfoOpen={setIsGroupInfoOpen}
					/>
				)}
				<div
					ref={messagesContainerDev}
					className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent relative"
				>
					{!isConversationsLoading &&
						!isMessagesLoading &&
						!isConversationsFetching &&
						!isMessagesFetching && (
							<div
								ref={topSentinelRef}
								className="h-32 w-full absolute top-0 left-0"
							/>
						)}

					{/* {isFetchingOlder && (
						<div className="sticky top-0 left-0 flex justify-center">
							<Spinner className="size-6" />
						</div>
					)} */}
					{isMessagesLoading && (
						<div className="space-y-4" aria-label="Loading messages">
							<Skeleton className="h-12 w-2/3 rounded-2xl" />
							<Skeleton className="ml-auto h-16 w-1/2 rounded-2xl" />
							<Skeleton className="h-10 w-1/3 rounded-2xl" />
						</div>
					)}
					{isMessagesError && !isMessagesLoading && (
						<div className="flex h-full items-center justify-center text-center">
							<div className="space-y-3">
								<h2 className="text-lg font-semibold text-slate-100">
									Couldn&apos;t load messages
								</h2>
								<p className="text-sm text-slate-400">
									Your messages couldn&apos;t be loaded. Please try again.
								</p>
								<Button
									onClick={() => refetchMessages()}
									variant="outline"
									disabled={isMessagesFetching}
								>
									<RefreshCw
										className={isMessagesFetching ? "animate-spin" : ""}
									/>
									{isMessagesFetching ? "Retrying..." : "Try again"}
								</Button>
							</div>
						</div>
					)}
					{!isMessagesLoading && !isMessagesError && messages?.length == 0 && (
						<p className="text-slate-400 text-center relative flex gap-2 justify-center">
							Why So Silent?
							<FaceSlightlyFrowning className="text-destructive" />
						</p>
					)}
					{!isMessagesLoading &&
						!isMessagesError &&
						messages?.map((msg, index) => {
							const previousMessage = messages[index - 1];
							const showDateDivider =
								!previousMessage ||
								!isSameCalendarDay(
									new Date(msg.createdAt),
									new Date(previousMessage.createdAt),
								);

							return (
								<React.Fragment key={msg._id}>
									{showDateDivider && (
										<div
											className="flex items-center gap-3 py-2"
											role="separator"
										>
											<div className="h-px flex-1 bg-slate-800" />
											<div className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
												{getDateDividerLabel(msg.createdAt)}
											</div>
											<div className="h-px flex-1 bg-slate-800" />
										</div>
									)}
									<ConversationMessage
										currentUserId={currentUser?._id}
										inputRef={inputRef}
										isPrivate={isPrivate}
										otherUserUsername={otherUser?.username}
										setReplyMessage={setReplyMessage}
										msg={msg}
									/>
								</React.Fragment>
							);
						})}
				</div>

				{/* Message Input Area */}
				<div className="p-4 sm:p-5 border-t border-slate-800 bg-[#0a1014]/90 backdrop-blur-xl">
					<div className="flex flex-col bg-slate-900 border border-slate-800 rounded-2xl focus-within:border-teal-500/50 transition-all shadow-sm overflow-hidden">
						{typingNames.length > 0 && (
							<p className="px-4 pt-2 text-xs text-teal-400" aria-live="polite">
								{typingNames.length === 1
									? `${typingNames[0]} is typing...`
									: `${typingNames.slice(0, 2).join(", ")} are typing...`}
							</p>
						)}
						<ConversationReplyWidget
							currentUserId={currentUser?._id}
							isPrivate={isPrivate}
							replyMessage={replyMessage}
							setReplyMessage={setReplyMessage}
							otherUserUsername={otherUser?.username}
						/>

						<ConversationForm
							conversationId={conversation?._id}
							currentUserId={currentUser?._id}
							replyMessage={replyMessage}
							setReplyMessage={setReplyMessage}
							inputRef={inputRef}
						/>
					</div>
				</div>

				{!isPrivate && (
					<GroupInfoSidebar
						open={isGroupInfoOpen}
						onOpenChange={setIsGroupInfoOpen}
						conversation={conversation}
					/>
				)}
				{!isPrivate && (
					<EditGroupInfoSidebar
						open={isEditGroupOpen}
						onOpenChange={setIsEditGroupOpen}
						conversation={conversation}
						currentUser={currentUser}
					/>
				)}
			</main>
		);
	},
);

Conversation.displayName = "Conversation";

export default Conversation;
