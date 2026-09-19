"use client";
import { useIsMobile } from "@/hooks/use-mobile";
import { HeartCrack } from "lucide-react";

const Home = () => {
	const isMobile = useIsMobile();
	return (
		<div className="flex-1 flex items-center justify-center flex-col gap-1">
			{!isMobile && (
				<>
					<h2 className="text-4xl flex items-end gap-2">
						No Conversations Yet
						<HeartCrack size={32} className="text-destructive" />
					</h2>
					<p className="text-primary">Start A Conversation</p>
				</>
			)}
		</div>
	);
};

export default Home;
