import { Message } from "@/types";
import { Reply, X } from "lucide-react";
import React, { memo } from "react";

type Props = {
	replyMessage: Message | null;
	setReplyMessage: (message: Message | null) => void;
	currentUserId: string;
	isPrivate: boolean;
	otherUserUsername?: string;
};

export const ConversationReplyWidget = memo(
	({
		replyMessage,
		setReplyMessage,
		currentUserId,
		isPrivate,
		otherUserUsername,
	}: Props) => {
		if (!replyMessage) return;
		return (
			<div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 animate-in slide-in-from-bottom-2 duration-200">
				<div className="flex items-center gap-3 min-w-0 flex-1">
					<div className="w-1 h-8 bg-teal-500 rounded-full shrink-0" />
					<div className="flex flex-col min-w-0 flex-1 text-xs">
						<div className="flex items-center gap-1.5 font-medium text-teal-400">
							<Reply className="w-3.5 h-3.5" />
							<span>
								{replyMessage!.senderId === currentUserId
									? "Yourself"
									: isPrivate
										? otherUserUsername
										: "a message"}
							</span>
						</div>
						<p className="text-slate-400 truncate mt-0.5">
							{replyMessage!.text || "Attachment"}
						</p>
					</div>
				</div>

				<button
					type="button"
					onClick={() => setReplyMessage(null)}
					className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-colors shrink-0"
					aria-label="Cancel Reply"
				>
					<X className="w-4 h-4" />
				</button>
			</div>
		);
	},
);

ConversationReplyWidget.displayName = "ConversationReplyWidget";
