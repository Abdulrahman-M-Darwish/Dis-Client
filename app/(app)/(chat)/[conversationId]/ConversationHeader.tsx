import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Conversation, User } from "@/types";
import {
	ArrowLeft,
	ChevronRight,
	EllipsisVertical,
	Info,
	LogOut,
	Pencil,
	Trash2,
	Users,
	X,
} from "lucide-react";
import Image from "next/image";
import { memo, useState } from "react";
import { AddMembers } from "./AddMembers";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks";
import {
	useClearConversationMutation,
	useRemoveConversationMutation,
	useUpdateConversationMutation,
} from "@/store/api/conversations";

type Props = {
	conversation: Conversation | null;
	otherUser?: User | null;
	isPrivate: boolean;
	setIsGroupInfoOpen: (open: boolean) => void;
	setIsEditGroupOpen: (open: boolean) => void;
};

export const ConversationHeader = memo(
	({
		conversation,
		otherUser,
		isPrivate,
		setIsGroupInfoOpen,
		setIsEditGroupOpen,
	}: Props) => {
		const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);
		const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
		const [transferOwnershipTo, setTransferOwnershipTo] = useState("");
		const [clearChat] = useClearConversationMutation();
		const [removeConversation] = useRemoveConversationMutation();
		const router = useRouter();
		const currentUser = useAppSelector((state) => state.user.user);
		const isAdmin = conversation?.admins?.includes(currentUser?._id || "");
		const [updateConversation] = useUpdateConversationMutation();
		const isLastAdmin = Boolean(
			conversation &&
			currentUser &&
			conversation.admins?.length === 1 &&
			conversation.admins.includes(currentUser._id),
		);
		const transferCandidates = (conversation?.participants ?? []).filter(
			(participant): participant is User =>
				typeof participant !== "string" && participant._id !== currentUser?._id,
		);

		const handleClearChat = async () => {
			if (!conversation || !currentUser) return;
			await clearChat(conversation._id).unwrap();
		};

		const handleRemoveGroup = async () => {
			if (!conversation) return;
			await removeConversation(conversation._id);
		};

		const handleLeaveGroup = async () => {
			if (!conversation || !currentUser) return;
			if (isLastAdmin && !transferOwnershipTo) {
				setIsTransferDialogOpen(true);
				return;
			}
			await updateConversation({
				_id: conversation._id,
				participants: [currentUser._id],
				...(transferOwnershipTo && { transferOwnershipTo }),
			});
			router.replace("/");
		};

		return (
			<>
				<header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-[#0a1014]/80 px-4 py-4 backdrop-blur-md sm:px-6">
					<div className="flex items-center gap-3 sm:gap-4">
						<button
							type="button"
							aria-label="Back to conversations"
							className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100 md:hidden"
							onClick={() => router.push("/")}
						>
							<ArrowLeft className="size-5" />
						</button>
						<div className="relative">
							{otherUser?.avatarUrl || conversation?.groupAvatarUrl ? (
								<Image
									width={44}
									height={44}
									src={
										(otherUser?.avatarUrl ||
											conversation?.groupAvatarUrl) as string
									}
									alt={
										(otherUser?.username || conversation?.groupName) as string
									}
									className="h-11 w-11 rounded-full object-cover"
								/>
							) : (
								<div className="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-emerald-600 font-semibold text-sidebar-foreground">
									{otherUser?.username?.charAt(0) ||
										conversation?.groupName?.charAt(0)}
								</div>
							)}
						</div>
						<div>
							<h2 className="text-base font-semibold text-slate-100">
								{isPrivate ? otherUser?.username : conversation?.groupName}
							</h2>
							{isPrivate && (
								<p className="text-xs text-slate-400">{otherUser?.name}</p>
							)}
						</div>
					</div>

					<div className="flex items-center gap-2 sm:gap-4 text-slate-400">
						<div className="mx-1 hidden h-6 w-px bg-slate-800 sm:block" />
						<button className="cursor-pointer rounded-full p-2 transition-colors hover:bg-slate-800 hover:text-slate-100">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<EllipsisVertical />
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-45">
									{!isPrivate && (
										<>
											<DropdownMenuItem
												onSelect={() => setIsGroupInfoOpen(true)}
											>
												<Info className="size-4" />
												Info
											</DropdownMenuItem>
											{isAdmin && (
												<>
													<DropdownMenuItem
														onSelect={() => setIsEditGroupOpen(true)}
													>
														<Pencil className="size-4" />
														Edit
													</DropdownMenuItem>
													<DropdownMenuItem
														onSelect={() => setIsAddMembersOpen(true)}
													>
														<Users className="size-4" />
														Add Members
													</DropdownMenuItem>
												</>
											)}
										</>
									)}
									<DropdownMenuItem onSelect={() => router.replace("/")}>
										<ChevronRight className="size-4" />
										Close Chat
									</DropdownMenuItem>

									<DropdownMenuItem
										variant="destructive"
										onSelect={handleClearChat}
									>
										<X className="size-4" />
										Clear Chat
									</DropdownMenuItem>
									{!isPrivate && (
										<DropdownMenuItem
											variant="destructive"
											onSelect={handleLeaveGroup}
										>
											<LogOut className="size-4" />
											Leave Group
										</DropdownMenuItem>
									)}
									{isAdmin && (
										<DropdownMenuItem
											variant="destructive"
											onSelect={handleRemoveGroup}
										>
											<Trash2 className="size-4" />
											Delete Group
										</DropdownMenuItem>
									)}
								</DropdownMenuContent>
							</DropdownMenu>
						</button>
					</div>
				</header>
				{!isPrivate && (
					<AddMembers
						open={isAddMembersOpen}
						onOpenChange={setIsAddMembersOpen}
						conversation={conversation}
					/>
				)}
				<Dialog
					open={isTransferDialogOpen}
					onOpenChange={setIsTransferDialogOpen}
				>
					<DialogContent className="border-slate-800 bg-[#0a1014] text-slate-100">
						<DialogHeader>
							<DialogTitle>Transfer group ownership</DialogTitle>
							<DialogDescription className="text-slate-400">
								Choose a member to become the new admin before you leave.
							</DialogDescription>
						</DialogHeader>
						<Select
							value={transferOwnershipTo}
							onValueChange={setTransferOwnershipTo}
						>
							<SelectTrigger className="w-full border-slate-700 bg-slate-900 text-slate-100">
								<SelectValue placeholder="Select a new admin" />
							</SelectTrigger>
							<SelectContent>
								{transferCandidates.map((member) => (
									<SelectItem key={member._id} value={member._id}>
										{member.username}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<DialogFooter>
							<Button
								variant="ghost"
								onClick={() => setIsTransferDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button
								disabled={!transferOwnershipTo}
								onClick={async () => {
									await handleLeaveGroup();
									setIsTransferDialogOpen(false);
								}}
							>
								Transfer and leave
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</>
		);
	},
);

ConversationHeader.displayName = "ConversationHeader";
