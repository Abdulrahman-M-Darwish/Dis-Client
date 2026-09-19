"use client";

import { useRefreshMutation } from "@/store/api/auth";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { friendsApi } from "@/store/api/friends";
import { conversationsApi } from "@/store/api/conversations";
import { FriendRequest, FriendRequestStatus, Message, User } from "@/types";
import { Conversation } from "@/types";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import React, {
	createContext,
	memo,
	useContext,
	useEffect,
	useState,
} from "react";
import { io, Socket } from "socket.io-client";

const HEARTBEAT_INTERVAL = 90000;

type FriendSocketUser = Pick<User, "_id" | "username" | "name" | "avatarUrl">;

type FriendSocketUpdate = {
	userId: string;
	relationship: "NONE" | "SENT_PENDING" | "RECEIVED_PENDING" | "FRIEND";
	requestId?: string;
	user?: FriendSocketUser;
	conversation?: Conversation;
	conversationId?: string;
};

const SocketContext = createContext<{ socket: Socket | null }>({
	socket: null,
});

export const SocketProvider = memo(
	({ children }: { children: React.ReactNode }) => {
		const [refresh] = useRefreshMutation();
		const dispatch = useAppDispatch();
		const currentUserId = useAppSelector((state) => state.user.user?._id);
		const [socket, setSocket] = useState<Socket | null>(null);
		const router = useRouter();
		const pathname = usePathname();

		useEffect(() => {
			const refreshAccessToken = async (): Promise<string | null> => {
				try {
					const data = await refresh().unwrap();

					if (!data) return null;
					// Save new access token (or return directly)
					localStorage.setItem("accessToken", data.accessToken);
					return data.accessToken;
				} catch {
					return null;
				}
			};
			const token = localStorage.getItem("accessToken");

			const socketInstance = io(process.env.NEXT_PUBLIC_WS_URL, {
				auth: { token },
				transports: ["websocket"],
				autoConnect: true,
			});

			let heartbeatTimer: NodeJS.Timeout;

			socketInstance.on("connect", () => {
				setSocket(socketInstance);
				// Clear any existing timer to avoid duplicate intervals
				if (heartbeatTimer) clearInterval(heartbeatTimer);

				heartbeatTimer = setInterval(() => {
					if (socketInstance.connected) {
						socketInstance.emit("presence.ping");
					}
				}, HEARTBEAT_INTERVAL);
			});

			socketInstance.on("disconnect", () => {
				if (heartbeatTimer) clearInterval(heartbeatTimer);
			});

			socketInstance.on("exception", async (data) => {
				if (data?.message === "Invalid authentication token") {
					const newAccessToken = await refreshAccessToken();

					if (newAccessToken) {
						// 1. Update token object
						socketInstance.auth = { token: newAccessToken };

						// 2. Disconnect completely and reconnect to force new WS handshake frame
						socketInstance.disconnect();
						socketInstance.connect();
					} else {
						router.replace("/login");
					}
				}
			});

			return () => {
				if (heartbeatTimer) clearInterval(heartbeatTimer);
				socketInstance.disconnect();

				setSocket(null);
			};
		}, [refresh, router]);

		useEffect(() => {
			if (!socket) return;

			const handleFriendUpdate = (data: FriendSocketUpdate) => {
				if (!data.requestId && data.relationship !== "NONE") return;

				dispatch(
					friendsApi.util.updateQueryData(
						"getPendingRequests",
						undefined,
						(draft) => {
							if (data.relationship === "NONE") {
								draft.incoming = draft.incoming.filter(
									(request) => request._id !== data.requestId,
								);
								draft.outgoing = draft.outgoing.filter(
									(request) => request._id !== data.requestId,
								);
								return;
							}
							if (data.relationship === "FRIEND") {
								draft.incoming = draft.incoming.filter(
									(request) => request._id !== data.requestId,
								);
								draft.outgoing = draft.outgoing.filter(
									(request) => request._id !== data.requestId,
								);
								return;
							}
							if (!data.user || !data.requestId) return;
							const request: FriendRequest = {
								_id: data.requestId,
								sender:
									data.relationship === "RECEIVED_PENDING"
										? (data.user as User)
										: (currentUserId ?? ""),
								receiver:
									data.relationship === "SENT_PENDING"
										? (data.user as User)
										: (currentUserId ?? ""),
								status: FriendRequestStatus.PENDING,
							};
							const requests =
								data.relationship === "RECEIVED_PENDING"
									? draft.incoming
									: draft.outgoing;
							if (!requests.some((item) => item._id === data.requestId)) {
								requests.push(request);
							}
						},
					),
				);

				if (data.relationship === "FRIEND" && data.user) {
					dispatch(
						friendsApi.util.updateQueryData(
							"getFriends",
							undefined,
							(draft) => {
								if (!draft.some((friend) => friend._id === data.user?._id)) {
									draft.push(data.user as User);
								}
							},
						),
					);
				}

				if (data.relationship === "FRIEND" && data.conversation) {
					dispatch(
						conversationsApi.util.updateQueryData(
							"getAllConversations",
							undefined,
							(draft) => {
								if (
									!draft.some((item) => item._id === data.conversation?._id)
								) {
									if (!currentUserId || !data.conversation) return;
									draft.unshift({
										...data.conversation,
										participantsMetadata: [
											{
												clearedMessageId: "",
												lastReadMessageId: null,
												unreadCount: 0,
												userId: currentUserId,
											},
										],
									});
								}
							},
						),
					);
				}

				if (data.relationship === "NONE") {
					dispatch(
						friendsApi.util.updateQueryData(
							"getFriends",
							undefined,
							(draft) => {
								const index = draft.findIndex(
									(friend) => friend._id === data.userId,
								);
								if (index !== -1) draft.splice(index, 1);
							},
						),
					);

					if (data.conversationId) {
						dispatch(
							conversationsApi.util.updateQueryData(
								"getAllConversations",
								undefined,
								(draft) => {
									const index = draft.findIndex(
										(item) => item._id === data.conversationId,
									);
									if (index !== -1) draft.splice(index, 1);
								},
							),
						);
					}
				}
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
		}, [currentUserId, dispatch, socket]);

		useEffect(() => {
			if (!socket || !currentUserId) return;

			const removeConversationFromCache = (conversationId: string) => {
				dispatch(
					conversationsApi.util.updateQueryData(
						"getAllConversations",
						undefined,
						(draft) => {
							const index = draft.findIndex(
								(conversation) => conversation._id === conversationId,
							);
							if (index !== -1) draft.splice(index, 1);
						},
					),
				);
				if (pathname?.includes(`/${conversationId}`)) {
					router.replace("/");
				}
			};

			const handleConversationUpdated = (conversation: Conversation) => {
				const isParticipant = conversation.participants.some(
					(participant) =>
						(typeof participant === "string"
							? participant
							: (participant as User)._id) === currentUserId,
				);

				if (!isParticipant) {
					removeConversationFromCache(conversation._id);
					return;
				}

				dispatch(
					conversationsApi.util.updateQueryData(
						"getAllConversations",
						undefined,
						(draft) => {
							const index = draft.findIndex(
								(item) => item._id === conversation._id,
							);
							if (index === -1)
								draft.unshift({
									...conversation,
									participantsMetadata: [
										{
											clearedMessageId: "",
											lastReadMessageId: (conversation.lastMessage as Message)
												._id,
											unreadCount: 0,
											userId: currentUserId,
										},
									],
								});
							else draft[index] = { ...draft[index], ...conversation };
						},
					),
				);
			};

			const handleConversationDeleted = (data: { conversationId: string }) => {
				removeConversationFromCache(data.conversationId);
			};
			socket.on("conversation.updated", handleConversationUpdated);
			socket.on("conversation.deleted", handleConversationDeleted);

			return () => {
				socket.off("conversation.updated", handleConversationUpdated);
				socket.off("conversation.deleted", handleConversationDeleted);
			};
		}, [currentUserId, dispatch, pathname, router, socket]);

		return (
			<SocketContext.Provider value={{ socket }}>
				{children}
			</SocketContext.Provider>
		);
	},
);

SocketProvider.displayName = "SocketProvider";

// Custom Hook to consume the socket in any file
export const useSocket = () => useContext(SocketContext);
