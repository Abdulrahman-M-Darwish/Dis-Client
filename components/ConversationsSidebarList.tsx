import { useAppSelector } from "@/hooks";
import { Conversation, Message, User, UserStatus } from "@/types";
import { Paperclip } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { memo } from "react";

export const ConversationsSidebarList = memo(
	({ conversations }: { conversations?: Conversation[] }) => {
		const currentUser = useAppSelector((state) => state.user.user);

		const { conversationId } = useParams();
		return (
			<div className="relative overflow-auto flex-1">
				<div className="absolute flex h-full w-full flex-col gap-2 overflow-x-hidden px-4">
					{conversations?.map((chat, i) => {
						const isPrivate = chat.type === "PRIVATE";
						const currentUserMetadata = chat.participantsMetadata[0];
						const clearedMessageId = currentUserMetadata?.clearedMessageId;
						const lastMessage = chat.lastMessage as Message | undefined;
						const lastMessageIsCleared =
							Boolean(lastMessage && clearedMessageId) &&
							(lastMessage?._id || "") <= clearedMessageId;
						const otherUser = isPrivate
							? (chat.participants as User[]).filter(
									(participant) => participant._id !== currentUser?._id,
								)[0]
							: null;
						return (
							<Link href={`/${chat._id}`} key={i}>
								<button
									className={`flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-4 text-left transition hover:border-primary/60 hover:bg-sidebar-accent/60 cursor-pointer ${conversationId == chat._id ? "bg-sidebar-accent border-primary!" : "bg-sidebar-accent/20"}`}
								>
									<div className="relative">
										{!chat.groupAvatarUrl && !otherUser?.avatarUrl && (
											<div
												className={`flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br bg-emerald-500 font-semibold text-sidebar-foreground`}
											>
												{isPrivate
													? otherUser?.username.charAt(0)
													: chat?.groupName?.charAt(0)}
											</div>
										)}
										{isPrivate && otherUser?.avatarUrl && (
											<Image
												width={44}
												height={44}
												src={otherUser.avatarUrl}
												alt={otherUser.username}
												className="h-11 w-11 rounded-full object-cover"
											/>
										)}
										{!isPrivate && chat.groupAvatarUrl && (
											<Image
												width={44}
												height={44}
												src={chat.groupAvatarUrl}
												alt={chat.groupName!}
												className="h-11 w-11 rounded-full object-cover"
											/>
										)}
										{isPrivate && otherUser?.status === UserStatus.ONLINE && (
											<span className="absolute z-10 bottom-0 right-0 translate-0.75 w-3 h-3 bg-green-500 border-2 border-[#0a1014] rounded-full"></span>
										)}
									</div>
									<div className="min-w-0 flex-1 relative">
										<div className="flex items-center justify-between gap-2">
											<p className="truncate text-sm font-semibold">
												{isPrivate ? otherUser?.username : chat.groupName}
											</p>
											<p className="text-[11px] text-muted-foreground w-12.5">
												{!lastMessageIsCleared &&
													lastMessage &&
													new Date(lastMessage.createdAt).toLocaleTimeString(
														[],
														{
															hour: "2-digit",
															minute: "2-digit",
														},
													)}
											</p>
										</div>
										<p className="truncate text-sm text-muted-foreground">
											{lastMessageIsCleared ? (
												<span className="text-slate-400">Chat Cleared</span>
											) : lastMessage?.attachments?.length ? (
												<span className="flex gap-1 items-center">
													<Paperclip className="size-3" /> Attachment
												</span>
											) : lastMessage?.text ? (
												lastMessage.text
											) : (
												"No messages yet."
											)}
										</p>
										{chat.participantsMetadata[0].unreadCount > 0 && (
											<div className="text-[10px] font-bold w-6 h-6 flex items-center justify-center bg-emerald-400 rounded-full absolute -bottom-3 end-0">
												{chat.participantsMetadata[0].unreadCount}
											</div>
										)}
									</div>
								</button>
							</Link>
						);
					})}
				</div>
			</div>
		);
	},
);

ConversationsSidebarList.displayName = "ConversationsSidebarList";
