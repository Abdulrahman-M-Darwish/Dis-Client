"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { CircleAlert, FileText, Save, Settings, UserRound } from "lucide-react";
import { useUpdateUserMutation } from "@/store/api/users";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { useAppSelector } from "@/hooks";
import { useDropzone } from "react-dropzone";
import { uploadToCloudinary } from "@/utils";

// Strict validation schema matching the user model constraints
const profileSchema = z.object({
	username: z
		.string()
		.min(2, "Username must be at least 2 characters.")
		.max(30, "Username must not exceed 30 characters.")
		.regex(
			/^[a-zA-Z0-9_ ]+$/,
			"Username can only contain letters, numbers, and underscores.",
		),
	bio: z
		.string()
		.max(160, "Bio must be under 160 characters.")
		.optional()
		.or(z.literal("")),
	avatarUrl: z
		.url("Please enter a valid image URL.")
		.optional()
		.or(z.literal("")),
	bannerUrl: z
		.url("Please enter a valid image URL.")
		.optional()
		.or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function UpdateProfileModal() {
	const [updateProfile, { isLoading, error }] = useUpdateUserMutation();
	const user = useAppSelector((state) => state.user.user);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [bannerFiles, setBannerFiles] = useState<any>(null);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [avatarFiles, setAvatarFiles] = useState<any>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			username: user?.username || "",
			bio: user?.bio || "",
			avatarUrl: user?.avatarUrl || "",
			bannerUrl: user?.bannerUrl || "",
		},
	});
	// eslint-disable-next-line react-hooks/incompatible-library
	const watchedValues = form.watch();
	const onSubmit = async (values: ProfileFormValues) => {
		if (!user) return;
		try {
			setIsUploading(true);
			if (avatarFiles) values.avatarUrl = await uploadToCloudinary(avatarFiles);
			if (bannerFiles) values.bannerUrl = await uploadToCloudinary(bannerFiles);
			setIsUploading(false);
			await updateProfile({
				_id: user._id,
				...values,
			}).unwrap();
			setIsDialogOpen(false);
		} catch (err) {
			setIsUploading(false);
			console.error("Profile dispatch failed:", err);
		}
	};
	const { getRootProps, getInputProps } = useDropzone({
		onDrop: (acceptedFiles) => {
			setAvatarFiles(
				Object.assign(acceptedFiles[0], {
					preview: URL.createObjectURL(acceptedFiles[0]),
				}),
			);
		},
	});
	const { getRootProps: getBannerProps, getInputProps: getBannerInputProps } =
		useDropzone({
			onDrop: (acceptedFiles) => {
				setBannerFiles(
					Object.assign(acceptedFiles[0], {
						preview: URL.createObjectURL(acceptedFiles[0]),
					}),
				);
			},
		});
	const onOpenChange = (state: boolean) => {
		form.reset({
			username: user?.username || "",
			bio: user?.bio || "",
			avatarUrl: user?.avatarUrl || "",
			bannerUrl: user?.bannerUrl || "",
		});
		setIsDialogOpen(state);
		setAvatarFiles(null);
		setBannerFiles(null);
	};
	return (
		<Dialog onOpenChange={onOpenChange} open={isDialogOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="rounded-xl border-foreground/10 bg-slate-950/40 hover:bg-slate-900 text-xs gap-1.5 h-9 cursor-pointer"
					onClick={() => setIsDialogOpen(true)}
				>
					<Settings className="w-3.5 h-3.5" />
					Edit Profile
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-lg bg-slate-900/95 border-slate-800 text-slate-100 backdrop-blur-xl rounded-3xl p-0 overflow-hidden shadow-2xl gap-0">
				{/* Header Block */}
				<DialogHeader className="p-6 pb-4 border-b border-slate-800/60 bg-slate-950/20">
					<DialogTitle className="text-base font-bold tracking-tight text-slate-100">
						Edit Profile Visuals
					</DialogTitle>
					<DialogDescription className="text-xs text-slate-400">
						Update your identity properties and custom dashboard graphics
					</DialogDescription>
				</DialogHeader>

				{/* Scrollable Layout Form container */}
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col max-h-[75vh]"
				>
					<div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
						{/* Contextual Real-time Design Card Preview */}
						<div className="relative bg-slate-950/40 border border-slate-850 rounded-2xl overflow-hidden p-4">
							<p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
								Live Preview
							</p>

							{/* Banner Blueprint line */}
							<div
								{...getBannerProps()}
								className="h-24 w-full rounded-xl bg-linear-to-r from-slate-800 to-slate-750 relative overflow-hidden border border-slate-800/50 cursor-pointer"
							>
								<input {...getBannerInputProps()} />
								{(bannerFiles || watchedValues.bannerUrl) && (
									// eslint-disable-next-line @next/next/no-img-element
									<img
										src={bannerFiles?.preview || watchedValues.bannerUrl}
										alt="Banner preview"
										className="w-full h-full object-cover"
									/>
								)}
							</div>

							{/* Avatar Blueprint line */}
							<div className="px-4 flex items-end gap-3 -mt-6 relative z-10">
								<div
									{...getRootProps()}
									className="h-14 w-14 rounded-xl border-4 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden shadow-md shrink-0 cursor-pointer"
								>
									<input {...getInputProps()} />
									{avatarFiles || watchedValues.avatarUrl ? (
										// eslint-disable-next-line @next/next/no-img-element
										<img
											src={avatarFiles?.preview || watchedValues.avatarUrl}
											alt="Avatar preview"
											className="w-full h-full object-cover"
										/>
									) : (
										<span className="text-slate-400 text-sm font-bold">
											{watchedValues.username?.charAt(0).toUpperCase() || "?"}
										</span>
									)}
								</div>
								<div className="mb-1 min-w-0">
									<h4 className="text-sm font-bold truncate text-slate-200">
										{watchedValues.username || "Your Username"}
									</h4>
									<p className="text-[11px] text-slate-400 truncate italic max-w-55">
										{watchedValues.bio || "No description set..."}
									</p>
								</div>
							</div>
						</div>

						{/* Mutation Pipeline Communication Error Alert */}
						{error && (
							<div className="flex items-start gap-2.5 p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-200 text-xs">
								<CircleAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
								<p>
									Server rejected layout configurations. Please check data
									structures or internet parameters.
								</p>
							</div>
						)}

						{/* Field: Username */}
						<Controller
							control={form.control}
							name="username"
							render={({ field, fieldState }) => (
								<Field
									data-invalid={fieldState.invalid}
									className="space-y-1.5"
								>
									<FieldLabel className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
										<UserRound className="w-3.5 h-3.5 text-primary" /> Display
										Handle
									</FieldLabel>
									<Input
										{...field}
										aria-invalid={fieldState.invalid}
										disabled={isLoading}
										placeholder="cyber_samurai"
										className="bg-slate-950/40 border-slate-800 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:ring-offset-0 text-slate-200"
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						{/* Field: Bio Textarea */}
						<Controller
							control={form.control}
							name="bio"
							render={({ field, fieldState }) => (
								<Field
									data-invalid={fieldState.invalid}
									className="space-y-1.5 max-w-full"
								>
									<div className="flex justify-between items-center">
										<FieldLabel className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
											<FileText className="w-3.5 h-3.5 text-slate-500" /> User
											Profile Summary
										</FieldLabel>
										<span className="text-[10px] text-slate-500 font-medium">
											{(field.value || "").length}/160
										</span>
									</div>
									<Textarea
										{...field}
										aria-invalid={fieldState.invalid}
										disabled={isLoading}
										maxLength={160}
										placeholder="Write something memorable..."
										className="bg-slate-950/40 text-wrap border-slate-800 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:ring-offset-0 text-slate-200 resize-none min-h-22.5"
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
					</div>

					{/* Form Drawer Footer Actions */}
					<div className="p-4 border-t border-slate-800/60 bg-slate-950/40 flex justify-end gap-2.5">
						<Button
							type="button"
							variant="outline"
							disabled={isLoading}
							className="rounded-xl border-slate-800 bg-transparent text-slate-300 hover:bg-slate-900 text-xs px-4 h-9"
							onClick={() => setIsDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isLoading}
							className="rounded-xl text-xs gap-1.5 bg-primary text-primary-foreground hover:brightness-110 transition px-4 h-9 min-w-27.5"
						>
							<Save className="w-3.5 h-3.5" />
							{isLoading || isUploading ? "Saving..." : "Save Changes"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
