"use client";

import React from "react";
import Image from "next/image";
import {
	Users,
	ShieldCheck,
	Info,
	ChevronDown,
	CircleMinus,
} from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Conversation, User } from "@/types";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppSelector } from "@/hooks";
import { useUpdateConversationMutation } from "@/store/api/conversations";

interface GroupInfoSidebarProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	conversation: Conversation | null;
}

export const GroupInfoSidebar = ({
	open,
	onOpenChange,
	conversation,
}: GroupInfoSidebarProps) => {
	const currentUser = useAppSelector((state) => state.user.user);
	const [updateConversation] = useUpdateConversationMutation();

	if (!conversation) return null;
	const participants = conversation.participants as User[];

	const handleRemoveUser = async (userId: string) => {
		await updateConversation({
			_id: conversation._id,
			participants: [userId],
		});
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:max-w-md bg-[#0a1014] border-l border-slate-800 text-slate-100 p-0 flex flex-col h-full">
				<SheetHeader className="p-6 border-b border-slate-800/80">
					<SheetTitle className="text-slate-100 flex items-center gap-2 text-lg font-semibold">
						<Info className="w-5 h-5 text-emerald-500" />
						Group Info
					</SheetTitle>
				</SheetHeader>

				<ScrollArea className="flex-1 p-6 h-125">
					{/* Avatar and Details Header */}
					<div className="flex flex-col items-center text-center pb-6 border-b border-slate-800/80">
						<div className="relative mb-4">
							{conversation.groupAvatarUrl ? (
								<Image
									src={conversation.groupAvatarUrl}
									alt={conversation.groupName!}
									width={96}
									height={96}
									className="h-24 w-24 rounded-full object-cover border-2 border-emerald-500/30"
								/>
							) : (
								<div className="h-24 w-24 rounded-full bg-emerald-500 text-slate-950 font-bold text-3xl flex items-center justify-center">
									{conversation.groupName?.charAt(0)}
								</div>
							)}
						</div>
						<h3 className="text-xl font-bold text-slate-100 mb-1">
							{conversation.groupName}
						</h3>
						<p className="text-xs text-slate-400 flex items-center gap-1">
							<Users className="w-3.5 h-3.5 text-slate-500" />
							{participants.length} members
						</p>
					</div>
					<p className="py-6 border-b border-slate-800/80 flex flex-col gap-4">
						<span className="text-[10px] text-slate-500">DESCRIPTION:</span>
						<span className="px-4">{conversation.description}</span>
					</p>

					{/* Members List */}
					<div className="py-6">
						<h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
							Members ({participants.length})
						</h4>

						<div className="space-y-2">
							{participants.map((member) => {
								const isAdmin = conversation.admins!.includes(member._id);
								return (
									<div
										key={member._id}
										className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900/60 transition group relative"
									>
										<div className="flex items-center gap-3 min-w-0">
											<Avatar className="h-10 w-10">
												<AvatarImage src={member.avatarUrl} />
												<AvatarFallback className="bg-emerald-500 text-slate-950 font-semibold">
													{member.username.charAt(0)}
												</AvatarFallback>
											</Avatar>
											<div className="truncate">
												<p className="text-sm font-medium text-slate-200 truncate ">
													{member.username}
												</p>
												{member.name && (
													<p className="text-xs text-slate-400 truncate flex gap-1">
														{member.name}
														{member._id == currentUser?._id && (
															<span className="text-emerald-400">(You)</span>
														)}
													</p>
												)}
											</div>
										</div>

										{isAdmin && (
											<Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] gap-1 px-2 py-0.5">
												<ShieldCheck className="w-3 h-3" /> Admin
											</Badge>
										)}

										{member._id !== currentUser?._id &&
											conversation.admins!.includes(currentUser!._id) && (
												<DropdownMenu>
													<DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2.5 top-1/2 -translate-y-1/2">
														<ChevronDown />
													</DropdownMenuTrigger>
													<DropdownMenuContent>
														<DropdownMenuItem
															variant="destructive"
															onClick={() => handleRemoveUser(member._id)}
														>
															<CircleMinus />
															Remove
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											)}
									</div>
								);
							})}
						</div>
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	);
};
