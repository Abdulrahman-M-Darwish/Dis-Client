"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { Camera, Edit3, Loader2, ShieldAlert } from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Conversation, User } from "@/types";
import { useUpdateConversationMutation } from "@/store/api/conversations";
import { uploadToCloudinary } from "@/utils";
import { Textarea } from "@/components/ui/textarea";

interface EditGroupInfoSidebarProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	conversation: Conversation | null;
	currentUser: User | null;
}

export const EditGroupInfoSidebar = ({
	open,
	onOpenChange,
	conversation,
	currentUser,
}: EditGroupInfoSidebarProps) => {
	const [groupName, setGroupName] = useState("");
	const [groupDescription, setGroupDescription] = useState("");
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
	const [editGroup, { isLoading }] = useUpdateConversationMutation();

	// Sync state when conversation changes
	useEffect(() => {
		if (conversation) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setGroupName(conversation.groupName || "");
			setGroupDescription(conversation.description || "");
			setAvatarPreview(conversation.groupAvatarUrl || null);
			setAvatarFile(null);
		}
	}, [conversation, open]);

	// Check Admin Authorization
	const isAdmin = React.useMemo(() => {
		if (!currentUser || !conversation?.admins) return false;
		return (conversation.admins as string[]).includes(currentUser._id);
	}, [currentUser, conversation]);

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

	const handleSave = async () => {
		if (!groupName.trim() || !isAdmin || !conversation) return;
		try {
			const groupAvatarUrl = avatarFile
				? await uploadToCloudinary(avatarFile)
				: null;
			await editGroup({
				_id: conversation._id,
				groupName: groupName.trim(),
				groupAvatarUrl: groupAvatarUrl || conversation.groupAvatarUrl,
				description: groupDescription.trim(),
			});
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to update group:", error);
		}
	};

	if (!conversation) return null;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:max-w-md bg-[#0a1014] border-l border-slate-800 text-slate-100 p-0 flex flex-col h-full">
				<SheetHeader className="p-6 border-b border-slate-800/80">
					<SheetTitle className="text-slate-100 flex items-center gap-2 text-lg font-semibold">
						<Edit3 className="w-5 h-5 text-emerald-500" />
						Edit Group Details
					</SheetTitle>
				</SheetHeader>

				{/* Non-Admin Access Guard */}
				{!isAdmin ? (
					<div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
						<ShieldAlert className="w-12 h-12 text-red-500 mb-3" />
						<h4 className="text-base font-semibold text-slate-200">
							Admin Access Required
						</h4>
						<p className="text-xs text-slate-400 max-w-[260px] mt-1">
							Only group administrators can change the group name or image.
						</p>
					</div>
				) : (
					<div className="flex-1 p-6 flex flex-col gap-6">
						{/* Group Avatar Dropzone */}
						<div className="flex flex-col items-center gap-3">
							<label className="text-xs font-medium text-slate-400 self-start">
								Group Avatar
							</label>
							<div
								{...getRootProps()}
								className={`relative flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed transition overflow-hidden group ${
									isDragActive
										? "border-emerald-500 bg-emerald-500/10"
										: "border-slate-700 hover:border-emerald-500/50 bg-slate-900/60"
								}`}
							>
								<input {...getInputProps()} />
								{avatarPreview ? (
									<div className="relative h-full w-full">
										<Image
											src={avatarPreview}
											alt="Group Avatar"
											fill
											className="object-cover"
										/>
										<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
											<Camera className="h-6 w-6 text-white" />
										</div>
									</div>
								) : (
									<div className="flex flex-col items-center justify-center text-slate-400 text-xs text-center p-2">
										<Camera className="h-6 w-6 mb-1 text-slate-400" />
										<span className="text-[10px]">Upload Photo</span>
									</div>
								)}
							</div>
						</div>

						{/* Group Name Input */}
						<div className="flex flex-col gap-1.5">
							<label className="text-xs font-medium text-slate-400">
								Group Name
							</label>
							<Input
								value={groupName}
								onChange={(e) => setGroupName(e.target.value)}
								placeholder="Enter group name"
								className="bg-slate-900/80 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-xl text-sm focus-visible:ring-emerald-500"
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<label className="text-xs font-medium text-slate-400">
								Description
							</label>
							<Textarea
								value={groupDescription}
								onChange={(e) => setGroupDescription(e.target.value)}
								placeholder="Enter group Description"
								className="bg-slate-900/80 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-xl text-sm focus-visible:ring-emerald-500"
							/>
						</div>
					</div>
				)}

				{/* Action Footer */}
				{isAdmin && (
					<SheetFooter className="p-6 border-t border-slate-800/80 gap-2 sm:gap-0">
						<Button
							variant="ghost"
							onClick={() => onOpenChange(false)}
							className="rounded-xl text-slate-300 hover:bg-slate-800 hover:text-slate-100"
						>
							Cancel
						</Button>
						<Button
							onClick={handleSave}
							disabled={!groupName.trim() || isLoading}
							className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-xl"
						>
							{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Save Changes
						</Button>
					</SheetFooter>
				)}
			</SheetContent>
		</Sheet>
	);
};
