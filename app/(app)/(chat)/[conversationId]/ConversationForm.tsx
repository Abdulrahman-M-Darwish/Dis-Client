"use client";
import { useCreateMessageMutation } from "@/store/api/messages";
import { Message } from "@/types";
import { uploadToCloudinary } from "@/utils";
import { Paperclip, Send, X } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ConversationFormEmojiPicker } from "./ConversationFormEmojiPicker";
import { toast } from "sonner";
import { useSocket } from "@/components/SocketContext";

type Props = {
	conversationId: string;
	currentUserId: string;
	replyMessage: Message | null;
	setReplyMessage: (message: Message | null) => void;
	inputRef: React.RefObject<HTMLInputElement | null>;
};

export const ConversationForm = memo(
	({
		conversationId,
		currentUserId,
		replyMessage,
		setReplyMessage,
		inputRef,
	}: Props) => {
		const [messageInput, setMessageInput] = useState("");
		const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
		const [isUploading, setIsUploading] = useState(false);
		const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
		const isTypingRef = useRef(false);
		const { socket } = useSocket();
		const [sendMessage, { isLoading: isSendingMessage }] =
			useCreateMessageMutation();

		const stopTyping = useCallback(() => {
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current);
				typingTimeoutRef.current = null;
			}
			if (isTypingRef.current) {
				socket?.emit("conversation.stopTyping", conversationId);
				isTypingRef.current = false;
			}
		}, [conversationId, socket]);

		useEffect(() => stopTyping(), [stopTyping, conversationId]);

		const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			if (!messageInput.trim() && selectedFiles.length === 0) return;

			stopTyping();
			setIsUploading(true);
			try {
				const attachments = await Promise.all(
					selectedFiles.map(async (file) => ({
						url: await uploadToCloudinary(file),
						fileType: file.type.startsWith("image/")
							? ("image" as const)
							: file.type.startsWith("video/")
								? ("video" as const)
								: ("file" as const),
					})),
				);
				await sendMessage({
					conversationId,
					senderId: currentUserId,
					text: messageInput.trim() || undefined,
					attachments,
					reply: replyMessage?._id || undefined,
				}).unwrap();
				setReplyMessage(null);
				setMessageInput("");
				setSelectedFiles([]);
			} catch {
				toast.error("Could not send the message. Please try again.");
			} finally {
				setIsUploading(false);
				requestAnimationFrame(() => inputRef.current?.focus());
			}
		};
		const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
			if (e.target.files) {
				setSelectedFiles((files) => [...files, ...Array.from(e.target.files!)]);
			}
		};
		const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			setMessageInput(value);
			if (!value.trim()) {
				stopTyping();
				return;
			}
			if (!isTypingRef.current) {
				socket?.emit("conversation.typing", conversationId);
				isTypingRef.current = true;
			}
			if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
			typingTimeoutRef.current = setTimeout(stopTyping, 1500);
			console.log(isTypingRef.current);
		};

		return (
			<form
				onSubmit={handleSendMessage}
				className="flex flex-wrap items-center gap-3 px-4 py-2"
			>
				<ConversationFormEmojiPicker
					inputRef={inputRef}
					messageInput={messageInput}
					setMessageInput={setMessageInput}
					disabled={isUploading || isSendingMessage}
				/>
				<label
					htmlFor="message-attachments"
					className="text-slate-400 hover:text-teal-400 transition-colors shrink-0 cursor-pointer"
					title="Attach files"
				>
					<Paperclip />
					<input
						id="message-attachments"
						type="file"
						multiple
						className="sr-only"
						onChange={handleFilesSelected}
						disabled={isUploading || isSendingMessage}
					/>
				</label>

				{selectedFiles.length > 0 && (
					<div className="order-last flex w-full flex-wrap gap-2">
						{selectedFiles.map((file, index) => (
							<div
								key={`${file.name}-${file.lastModified}-${index}`}
								className="flex max-w-full items-center gap-1 rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-300"
							>
								<span className="max-w-48 truncate">{file.name}</span>
								<button
									type="button"
									aria-label={`Remove ${file.name}`}
									onClick={() =>
										setSelectedFiles((files) =>
											files.filter((_, fileIndex) => fileIndex !== index),
										)
									}
								>
									<X className="size-3" />
								</button>
							</div>
						))}
					</div>
				)}

				<input
					type="text"
					id="text-input"
					placeholder="Write a message..."
					ref={inputRef}
					value={messageInput}
					onChange={handleInputChange}
					className="flex-1 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500 px-2 py-1.5 caret-teal-500"
					disabled={isUploading || isSendingMessage}
				/>

				<button
					type="submit"
					disabled={
						isUploading ||
						isSendingMessage ||
						(!messageInput.trim() && selectedFiles.length === 0)
					}
					className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500 text-slate-950 hover:bg-teal-400 transition-colors disabled:opacity-50 disabled:hover:bg-teal-500 shrink-0 cursor-pointer"
					aria-label="Send Message"
				>
					{isUploading || isSendingMessage ? (
						<span className="size-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
					) : (
						<Send className="w-5 h-5" />
					)}
				</button>
			</form>
		);
	},
);

ConversationForm.displayName = "ConversationForm";
