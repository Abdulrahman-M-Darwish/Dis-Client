import { ConversationsSidebar } from "@/components/ConversationsSidebar";
import React from "react";

const ChatLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="flex min-h-0 min-w-0 flex-1 items-center justify-center bg-[radial-gradient(circle_at_top_left,var(--primary),transparent_20%)] pb-16 text-slate-100 md:min-h-svh md:pb-0">
			<ConversationsSidebar />
			{children}
		</div>
	);
};

export default ChatLayout;
