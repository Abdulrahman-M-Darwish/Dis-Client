import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/hooks";
import { useCreateMessageMutation } from "@/store/api/messages";
import { ConversationType, Message, User } from "@/types";
import { ArrowRightFromLine, Search, Send } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const ForwardConversationMessage = ({
	message,
}: {
	message: Message;
}) => {
	const [searchQuery, setSearchQuery] = useState("");
	const conversations = useAppSelector(
		(state) => state.conversations.conversations,
	);
	const currentUser = useAppSelector((state) => state.user.user);
	const [createMessage] = useCreateMessageMutation();

	const handleForward = async (conversationId: string) => {
		if (!currentUser) return;

		const { error } = await createMessage({
			conversationId,
			senderId: currentUser._id,
			text: message.text,
			attachments: message.attachments,
			isForwarded: true,
		});

		if (error) {
			toast.error("Failed to forward message. Please try again.");
			return;
		}

		toast.success("Message forwarded");
	};

	const filteredConversations = useMemo(() => {
		if (!conversations) return [];
		if (!searchQuery.trim()) return conversations;

		const query = searchQuery.toLowerCase();

		return conversations.filter((conv) => {
			const isPrivate = conv.type === ConversationType.PRIVATE;
			let displayName = "";

			if (isPrivate) {
				const otherUser = conv.participants.find(
					(user) => (user as User)._id !== currentUser?._id,
				) as User;
				displayName = otherUser?.username || "";
			} else {
				displayName = conv.groupName || "";
			}

			return displayName.toLowerCase().includes(query);
		});
	}, [conversations, searchQuery, currentUser]);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
					<ArrowRightFromLine className="size-4 mr-2" />
					Forward
				</DropdownMenuItem>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-slate-100">
				<DialogHeader>
					<DialogTitle>Forward Message</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-4 py-2">
					{/* Search Input */}
					<div className="relative">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
						<Input
							type="text"
							placeholder="Search users..."
							className="pl-9 bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500 focus-visible:ring-teal-500"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>

					<div className="flex flex-col gap-1 max-h-75 overflow-y-auto pr-1">
						{filteredConversations.length === 0 ? (
							<div className="text-center py-6 text-sm text-slate-500">
								No results found for &quot;{searchQuery}&quot;
							</div>
						) : (
							filteredConversations.map((conv) => {
								const isPrivate = conv.type == ConversationType.PRIVATE;
								const otherUser = isPrivate
									? (conv.participants.find(
											(user) => (user as User)._id !== currentUser?._id,
										) as User)
									: null;
								return (
									<div
										key={"forward" + conv._id}
										className="flex items-center justify-between p-2 hover:bg-slate-800 rounded-lg group transition-colors"
									>
										<div className="flex items-center gap-3">
											<div className="w-9 h-9 rounded-full bg-teal-700 flex items-center justify-center text-teal-50 font-semibold text-sm overflow-hidden">
												{otherUser ? (
													otherUser.avatarUrl ? (
														<Image
															className="w-full h-full object-cover"
															src={otherUser?.avatarUrl}
															alt={otherUser?.username}
															width={36}
															height={36}
														/>
													) : (
														otherUser.username.charAt(0).toUpperCase()
													)
												) : conv.groupAvatarUrl ? (
													<Image
														className="w-full h-full object-cover"
														src={conv.groupAvatarUrl}
														alt={conv.groupName!}
														width={36}
														height={36}
													/>
												) : (
													conv.groupName?.charAt(0).toUpperCase()
												)}
											</div>
											<span className="text-sm font-medium text-slate-200">
												{otherUser ? otherUser.username : conv.groupName}
											</span>
										</div>

										<button
											onClick={() => handleForward(conv._id)}
											className="p-2 text-slate-400 hover:text-teal-400 hover:bg-teal-950/50 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none"
										>
											<Send className="h-4 w-4" />
										</button>
									</div>
								);
							})
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
