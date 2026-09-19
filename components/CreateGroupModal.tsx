"use client";

import React, { useState, useCallback, useMemo, memo } from "react";
import { useDropzone } from "react-dropzone";
import { Camera, X, Check, Search, Users, Loader2 } from "lucide-react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConversationType, User } from "@/types";
import { useGetFriendsQuery } from "@/store/api/friends";
import { useCreateConversationMutation } from "@/store/api/conversations";
import { uploadToCloudinary } from "@/utils";
import { useAppSelector } from "@/hooks";

interface CreateGroupModalProps {
	children: React.ReactNode;
}

export const CreateGroupModal = memo(({ children }: CreateGroupModalProps) => {
	const [open, setOpen] = useState(false);
	const [groupName, setGroupName] = useState("");
	const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
	const { data: friends, isLoading } = useGetFriendsQuery();
	const [createGroup, { isLoading: isGroupLoading }] =
		useCreateConversationMutation();
	const currentUser = useAppSelector((state) => state.user.user);

	// Handle Drag & Drop Avatar Upload

	const onDrop = useCallback((acceptedFiles: File[]) => {
		const file = acceptedFiles[0];
		if (file) {
			setAvatarFile(file);
			const objectUrl = URL.createObjectURL(file);
			setAvatarPreview(objectUrl);
		}
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
		maxFiles: 1,
	});

	const removeAvatar = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (avatarPreview) URL.revokeObjectURL(avatarPreview);
		setAvatarFile(null);
		setAvatarPreview(null);
	};

	const toggleUserSelection = (user: User) => {
		setSelectedUsers((prev) =>
			prev.some((u) => u._id === user._id)
				? prev.filter((u) => u._id !== user._id)
				: [...prev, user],
		);
	};

	const handleCreate = async () => {
		if (!groupName.trim() || selectedUsers.length === 0) return;
		try {
			let groupAvatarUrl: string | undefined;
			if (avatarFile) groupAvatarUrl = await uploadToCloudinary(avatarFile);
			await createGroup({
				type: ConversationType.GROUP,
				groupName: groupName.trim(),
				participants: [...selectedUsers.map((u) => u._id), currentUser!._id],
				admins: [currentUser!._id],
				groupAvatarUrl,
			});
			// Reset state on success
			setOpen(false);
			setGroupName("");
			setSelectedUsers([]);
			setAvatarFile(null);
			setAvatarPreview(null);
		} catch (error) {
			console.error("Failed to create group:", error);
		}
	};

	const filteredUsers = useMemo(
		() =>
			friends?.filter((user) =>
				user.username.toLowerCase().includes(searchQuery.trim().toLowerCase()),
			) || [],
		[friends, searchQuery],
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-115 bg-sidebar text-sidebar-foreground border-foreground/10 rounded-2xl p-6">
				<DialogHeader>
					<DialogTitle className="text-xl font-semibold flex items-center gap-2">
						<Users className="w-5 h-5 text-emerald-500" />
						Create New Group
					</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-5 py-2">
					{/* Avatar Upload Dropzone & Group Name Input */}
					<div className="flex items-center gap-4">
						<div
							{...getRootProps()}
							className={`relative flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed transition shrink-0 ${
								isDragActive
									? "border-emerald-500 bg-emerald-500/10"
									: "border-foreground/20 hover:border-emerald-500/50 bg-sidebar-foreground/5"
							}`}
						>
							<input {...getInputProps()} />
							{avatarPreview ? (
								<div className="relative h-full w-full">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src={avatarPreview}
										alt="Group Avatar"
										className="h-full w-full object-cover rounded-full"
									/>
									<button
										type="button"
										onClick={removeAvatar}
										className="absolute top-0 right-0 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 z-50"
									>
										<X className="h-3.5 w-3.5" />
									</button>
								</div>
							) : (
								<div className="flex flex-col items-center justify-center text-muted-foreground text-xs text-center p-1">
									<Camera className="h-5 w-5 mb-0.5 text-foreground/60" />
									<span className="text-[9px] font-medium leading-none">
										Photo
									</span>
								</div>
							)}
						</div>

						<div className="flex-1">
							<label className="text-xs font-medium text-muted-foreground mb-1 block">
								Group Name
							</label>
							<Input
								value={groupName}
								onChange={(e) => setGroupName(e.target.value)}
								placeholder="e.g. Design Team"
								className="bg-sidebar-foreground/10 border-foreground/10 rounded-xl focus-visible:ring-emerald-500"
							/>
						</div>
					</div>

					{/* Selected Members Chips */}
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
									<span className="truncate max-w-25">{user.username}</span>
									<button
										onClick={() => toggleUserSelection(user)}
										className="rounded-full hover:bg-emerald-500/20 p-0.5"
									>
										<X className="h-3 w-3" />
									</button>
								</Badge>
							))}
						</div>
					)}

					{/* Add Members Search & List */}
					<div className="flex flex-col gap-2">
						<label className="text-xs font-medium text-muted-foreground">
							Add Members ({selectedUsers.length})
						</label>
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
							<Input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search users..."
								className="pl-9 bg-sidebar-foreground/10 border-foreground/10 rounded-xl text-sm"
							/>
						</div>

						<div className="max-h-48 overflow-y-auto flex flex-col gap-1 pr-1 mt-1">
							{filteredUsers.length === 0 ? (
								<p className="text-xs text-center text-muted-foreground py-4">
									No users found
								</p>
							) : (
								filteredUsers.map((user) => {
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
													: "hover:bg-sidebar-foreground/5 border border-transparent"
											}`}
										>
											<div className="flex items-center gap-3 min-w-0">
												<Avatar className="h-9 w-9">
													<AvatarImage src={user.avatarUrl} />
													<AvatarFallback className="bg-emerald-500 font-semibold text-white">
														{user.username.charAt(0)}
													</AvatarFallback>
												</Avatar>
												<div className="truncate">
													<p className="text-sm font-medium leading-none text-foreground truncate">
														{user.username}
													</p>
												</div>
											</div>
											<div
												className={`h-5 w-5 rounded-full border flex items-center justify-center transition ${
													isSelected
														? "bg-emerald-500 border-emerald-500 text-black"
														: "border-foreground/20"
												}`}
											>
												{isSelected && <Check className="h-3 w-3 stroke-3" />}
											</div>
										</button>
									);
								})
							)}
						</div>
					</div>
				</div>

				<DialogFooter className="gap-2 sm:gap-0 pt-2">
					<Button
						variant="ghost"
						onClick={() => setOpen(false)}
						className="rounded-xl hover:bg-sidebar-foreground/10"
					>
						Cancel
					</Button>
					<Button
						onClick={handleCreate}
						disabled={
							!groupName.trim() ||
							selectedUsers.length === 0 ||
							isLoading ||
							isGroupLoading
						}
						className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl"
					>
						{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Create Group
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
});

CreateGroupModal.displayName = "CreateGroupModal";
