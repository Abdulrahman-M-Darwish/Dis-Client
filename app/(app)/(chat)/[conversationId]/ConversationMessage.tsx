import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Message } from "@/types";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	ArrowRightFromLine,
	ChevronDown,
	Copy,
	Reply,
	Trash,
	X,
} from "lucide-react";
import React, { memo, useCallback, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { EditConversationMessage } from "./EditConversationMessage";
import { useRemoveMessageMutation } from "@/store/api/messages";
import { ForwardConversationMessage } from "./ForwardConversationMessage";

type Props = {
	msg: Message;
	currentUserId: string;
	isPrivate: boolean;
	otherUserUsername?: string;
	inputRef: React.RefObject<HTMLInputElement | null>;
	setReplyMessage: (message: Message | null) => void;
};

export const ConversationMessage = memo(
	({
		msg,
		currentUserId,
		isPrivate,
		otherUserUsername,
		inputRef,
		setReplyMessage,
	}: Props) => {
		const [removeMessage, { isLoading: isDeleting }] =
			useRemoveMessageMutation();
		const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
		const isMe = msg.senderId === currentUserId;
		const parentMessage = msg.reply as Message;
		const isParentMe = parentMessage?.senderId === currentUserId;

		const replySenderName = isParentMe
			? "You"
			: isPrivate
				? otherUserUsername
				: parentMessage?.sender.username;
		const handleCopyMessage = async () => {
			await navigator.clipboard.writeText(msg.text || "");
			toast("Copied to clipboard", {
				style: { backgroundColor: "#111827", width: "300px" },
				icon: "📋",
				position: "top-right",
				action: {
					label: <X className="w-4 h-4" />,
					onClick: () => toast.dismiss(),
				},
				className: "[&>button]:!bg-transparent [&>button]:!text-slate-400",
			});
		};
		const handleReplyMessage = useCallback(() => {
			setReplyMessage(msg);
			requestAnimationFrame(() => {
				inputRef.current?.focus();
			});
		}, [inputRef, msg, setReplyMessage]);
		const handleConfirmDelete = async () => {
			const { error } = await removeMessage(msg._id);
			if (error) {
				toast.error("Failed To Remove Message");
				return false;
			}
			setIsDeleteDialogOpen(false);
		};
		const imageAttachments =
			msg.attachments?.filter(
				(attachment) => attachment.fileType === "image",
			) ?? [];
		const otherAttachments =
			msg.attachments?.filter(
				(attachment) => attachment.fileType !== "image",
			) ?? [];

		if (msg.isSystem) {
			return (
				<div className="flex w-full justify-center py-1">
					<p className="rounded-full bg-slate-800/70 px-3 py-1 text-center text-xs text-slate-400">
						{msg.text}
					</p>
				</div>
			);
		}

		return (
			<div
				key={msg._id}
				className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
			>
				<div
					className={`max-w-full sm:max-w-[65%] overflow-hidden flex flex-col relative group ${
						isMe ? "items-end" : "items-start"
					}`}
				>
					<div
						style={{ wordBreak: "break-word" }}
						className={`px-3 py-2 rounded-2xl text-sm shadow-sm wrap-break-word flex flex-col gap-1 ${
							isMe
								? "bg-teal-600 text-white rounded-br-sm"
								: "bg-slate-800 text-slate-100 rounded-bl-sm border border-slate-700/50"
						}`}
					>
						{msg.isForwarded && (
							<span
								className={`text-xs items-center font-semibold flex gap-2 ${
									isMe ? "text-white/70" : "text-slate-400"
								}`}
							>
								<ArrowRightFromLine className="w-4 h-4" /> Forwarded
							</span>
						)}
						{!isPrivate && msg.senderId !== currentUserId && (
							<p className="text-sky-400 uppercase text-[10px]">
								{msg.sender.username}
							</p>
						)}
						{parentMessage && (
							<div
								className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded-[6px] border-l-4 text-xs ${
									isMe
										? "bg-teal-700/60 border-white/80 text-teal-100"
										: "bg-slate-900/60 border-teal-500 text-slate-300"
								}`}
							>
								<div className="grid flex-1">
									<span
										className={`font-semibold text-[11px] truncate ${
											isMe ? "text-white" : "text-teal-400"
										}`}
									>
										{replySenderName}
									</span>
									<p className="truncate text-slate-200/90 text-[11px] mt-0.5 w-full">
										{parentMessage.text || "Attachment"}
									</p>
								</div>
							</div>
						)}

						{/* Current Message Text */}

						{imageAttachments.length > 0 && (
							<div
								className={`grid max-w-full gap-1 overflow-hidden rounded-lg ${
									imageAttachments.length === 1 ? "grid-cols-1" : "grid-cols-2"
								}`}
							>
								{imageAttachments.map((attachment, index) => (
									<a
										key={`${attachment.url}-${index}`}
										href={attachment.url}
										target="_blank"
										rel="noreferrer"
										className={`relative block overflow-hidden bg-black/20 ${
											imageAttachments.length === 1
												? "max-h-72"
												: "aspect-square"
										}`}
									>
										<Image
											src={attachment.url}
											alt={`Image attachment ${index + 1}`}
											width={320}
											height={240}
											className={`h-full w-full ${
												imageAttachments.length === 1
													? "max-h-72 object-contain"
													: "object-cover transition-transform hover:scale-105"
											}`}
											sizes="(max-width: 640px) 45vw, 200px"
										/>
									</a>
								))}
							</div>
						)}

						{otherAttachments.length > 0 && (
							<div className="flex max-w-full flex-col gap-2">
								{otherAttachments.map((attachment, index) => (
									<div
										key={`${attachment.url}-${index}`}
										className="max-w-full"
									>
										{attachment.fileType === "video" ? (
											<video
												controls
												className="max-h-60 max-w-full rounded-lg"
												src={attachment.url}
											/>
										) : (
											<a
												href={attachment.url}
												target="_blank"
												rel="noreferrer"
												className="text-sm underline underline-offset-2 hover:text-teal-200"
											>
												Download attachment {index + 1}
											</a>
										)}
									</div>
								))}
							</div>
						)}

						{msg.text && <p className="px-1 text-base">{msg.text}</p>}

						{/* Timestamp */}
						<span
							className={`text-[10px] self-end px-1 font-semibold ${
								isMe ? "text-white/70" : "text-slate-400"
							}`}
						>
							{msg.isEdited && "Edited "}
							{new Date(msg.createdAt).toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</span>

						{/* Context Menu Dropdown */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button className="absolute top-0 end-0 p-1.5 cursor-pointer opacity-0 transition-all group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 focus:outline-none">
									<ChevronDown size={20} />
									<span className="absolute w-full h-full top-0 left-0 bg-black blur-2xl"></span>
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-40 p-1.5 space-y-1">
								<DropdownMenuItem onClick={handleReplyMessage}>
									<Reply className="size-4" />
									Reply
								</DropdownMenuItem>
								<DropdownMenuItem onClick={handleCopyMessage}>
									<Copy className="size-4" />
									Copy
								</DropdownMenuItem>
								<ForwardConversationMessage message={msg} />
								{isMe && (
									<>
										<EditConversationMessage message={msg} />
										<DropdownMenuSeparator />
										<DropdownMenuItem
											variant="destructive"
											onSelect={(event) => {
												event.preventDefault();
												setIsDeleteDialogOpen(true);
											}}
										>
											<Trash className="size-4" />
											Delete
										</DropdownMenuItem>
									</>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
				<AlertDialog
					open={isDeleteDialogOpen}
					onOpenChange={setIsDeleteDialogOpen}
				>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete this message?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. The message will be permanently
								removed from the conversation.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								variant="destructive"
								onClick={handleConfirmDelete}
								disabled={isDeleting}
							>
								{isDeleting ? "Deleting..." : "Delete message"}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		);
	},
);

ConversationMessage.displayName = "ConversationMessage";
