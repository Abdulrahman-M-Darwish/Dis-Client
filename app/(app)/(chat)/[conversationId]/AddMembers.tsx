"use client";

import React, { useState } from "react";
import { Check, Loader2, Search, UserPlus, X } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Conversation, User } from "@/types";
import { useGetFriendsQuery } from "@/store/api/friends";
import { useUpdateConversationMutation } from "@/store/api/conversations";

interface AddMembersModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	conversation: Conversation | null;
	onAddMembers?: (selectedUserIds: string[]) => Promise<void>;
}

export const AddMembers = ({
	open,
	onOpenChange,
	conversation,
	onAddMembers,
}: AddMembersModalProps) => {
	const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { data: friends } = useGetFriendsQuery();
	const [addMembers] = useUpdateConversationMutation();

	// Extract current participant IDs to exclude them from search
	const currentParticipantIds = conversation?.participants.map(
		(p) => (p as User)._id,
	);

	// Filter users: search query match + not already in the conversation
	const eligibleUsers =
		friends?.filter(
			(user) =>
				!currentParticipantIds?.includes(user._id) &&
				user.username.toLowerCase().includes(searchQuery.toLowerCase()),
		) || [];

	const toggleUserSelection = (user: User) => {
		setSelectedUsers((prev) =>
			prev.some((u) => u._id === user._id)
				? prev.filter((u) => u._id !== user._id)
				: [...prev, user],
		);
	};

	const handleAdd = async () => {
		if (selectedUsers.length === 0 || !conversation) return;
		await addMembers({
			_id: conversation?._id,
			participants: selectedUsers.map((u) => u._id),
		});
		try {
			setIsLoading(true);
			if (onAddMembers) {
				await onAddMembers(selectedUsers.map((u) => u._id));
			}
			setSelectedUsers([]);
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to add members:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[460px] bg-[#0a1014] text-slate-100 border-slate-800 rounded-2xl p-6">
				<DialogHeader>
					<DialogTitle className="text-xl font-semibold flex items-center gap-2">
						<UserPlus className="w-5 h-5 text-emerald-500" />
						Add Members to {conversation?.groupName || "Group"}
					</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-4 py-2">
					{/* Selected Chips */}
					{selectedUsers.length > 0 && (
						<div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
							{selectedUsers.map((user) => (
								<Badge
									key={user._id}
									variant="secondary"
									className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border-transparent gap-1 py-1 pl-1.5 pr-1 rounded-full text-xs font-medium"
								>
									<Avatar className="h-4 w-4">
										<AvatarImage src={user.avatarUrl} />
										<AvatarFallback className="text-[9px] bg-emerald-600 text-white">
											{user.username.charAt(0)}
										</AvatarFallback>
									</Avatar>
									<span className="truncate max-w-[100px]">
										{user.username}
									</span>
									<button
										type="button"
										onClick={() => toggleUserSelection(user)}
										className="rounded-full hover:bg-emerald-500/20 p-0.5"
									>
										<X className="h-3 w-3" />
									</button>
								</Badge>
							))}
						</div>
					)}

					{/* Search Bar */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
						<Input
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search users to add..."
							className="pl-9 bg-slate-900/80 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-xl text-sm focus-visible:ring-emerald-500"
						/>
					</div>

					{/* User List */}
					<div className="max-h-56 overflow-y-auto flex flex-col gap-1 pr-1">
						{eligibleUsers.length === 0 ? (
							<p className="text-xs text-center text-slate-400 py-6">
								No eligible users found
							</p>
						) : (
							eligibleUsers.map((user) => {
								const isSelected = selectedUsers.some(
									(u) => u._id === user._id,
								);
								return (
									<button
										key={user._id}
										type="button"
										onClick={() => toggleUserSelection(user)}
										className={`flex items-center justify-between p-2 rounded-xl text-left transition cursor-pointer ${
											isSelected
												? "bg-emerald-500/10 border border-emerald-500/30"
												: "hover:bg-slate-800/50 border border-transparent"
										}`}
									>
										<div className="flex items-center gap-3 min-w-0">
											<Avatar className="h-9 w-9">
												<AvatarImage src={user.avatarUrl} />
												<AvatarFallback className="bg-emerald-500 font-semibold text-slate-950">
													{user.username.charAt(0)}
												</AvatarFallback>
											</Avatar>
											<div className="truncate">
												<p className="text-sm font-medium leading-none text-slate-200 truncate">
													{user.username}
												</p>
											</div>
										</div>
										<div
											className={`h-5 w-5 rounded-full border flex items-center justify-center transition ${
												isSelected
													? "bg-emerald-500 border-emerald-500 text-slate-950"
													: "border-slate-700"
											}`}
										>
											{isSelected && <Check className="h-3 w-3 stroke-[3]" />}
										</div>
									</button>
								);
							})
						)}
					</div>
				</div>

				<DialogFooter className="gap-2 sm:gap-0 pt-2">
					<Button
						variant="ghost"
						onClick={() => onOpenChange(false)}
						className="rounded-xl text-slate-300 hover:bg-slate-800 hover:text-slate-100"
					>
						Cancel
					</Button>
					<Button
						onClick={handleAdd}
						disabled={selectedUsers.length === 0 || isLoading}
						className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-xl"
					>
						{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Add {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ""}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
