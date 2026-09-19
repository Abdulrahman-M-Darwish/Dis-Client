"use client";
import { LogOut, MessageCircle, Search, User, UsersRound } from "lucide-react";
import { Sidebar, SidebarContent, SidebarHeader } from "./ui/sidebar";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/hooks";
import Image from "next/image";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useLogoutMutation } from "@/store/api/auth";
import { useRouter } from "next/navigation";
import { baseApi } from "@/store/api";
import { setUser } from "@/store/features/userSlice";
import { useGetPendingRequestsQuery } from "@/store/api/friends";

export const AppSidebar = () => {
	const user = useAppSelector((state) => state.user.user);
	const [serverLogout] = useLogoutMutation();
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { data: requests } = useGetPendingRequestsQuery();
	const logout = async () => {
		const { error } = await serverLogout();
		if (error) return;
		localStorage.removeItem("accessToken");
		dispatch(baseApi.util.resetApiState());
		dispatch(setUser(null));
		router.replace("/login");
	};

	if (!user) return;
	return (
		<>
			<div className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t bg-sidebar px-3 md:hidden">
				<Link
					href="/"
					className="rounded-full p-2 text-primary hover:bg-primary hover:text-primary-foreground"
				>
					<MessageCircle size={24} />
				</Link>
				<Link
					href="/friends"
					className="rounded-full p-2 text-primary hover:bg-primary hover:text-primary-foreground"
				>
					<UsersRound size={24} />
				</Link>
				<Link
					href="/search"
					className="rounded-full p-2 text-primary hover:bg-primary hover:text-primary-foreground"
				>
					<Search size={22} />
				</Link>
				<Link href={`/profile/${user._id}`} className="rounded-xl">
					{user.avatarUrl ? (
						<Image
							width={36}
							height={36}
							src={user.avatarUrl}
							alt={user.username}
							className="h-9 w-9 rounded-xl object-cover"
						/>
					) : (
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground">
							{user.username?.charAt(0).toUpperCase()}
						</div>
					)}
				</Link>
			</div>
			<Sidebar className="w-20!" collapsible="icon">
				<SidebarHeader className="hidden items-center justify-center pt-4 md:flex">
					<div className="flex items-center justify-center cursor-pointer h-11 w-11 rounded-full bg-linear-to-br from-emerald-400 to-teal-500 font-semibold text-primary-foreground">
						Dis
					</div>
				</SidebarHeader>
				<SidebarContent className="flex w-full flex-row items-center justify-around gap-1 px-2 py-2 md:w-20 md:flex-col md:gap-4 md:px-0 md:py-4">
					<Link href="/">
						<button className="w-auto h-auto p-2 hover:bg-primary text-primary hover:text-primary-foreground rounded-full transition-colors cursor-pointer">
							<MessageCircle size={28} />
						</button>
					</Link>
					<Link href="/friends">
						<button className="w-auto h-auto p-2 hover:bg-primary text-primary hover:text-primary-foreground rounded-full transition-colors cursor-pointer relative">
							<UsersRound size={28} />
							{(requests?.incoming.length || 0) > 0 && (
								<span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-400 rounded-full" />
							)}
						</button>
					</Link>
					<Link href="/search">
						<button className="w-auto h-auto p-2 hover:bg-primary text-primary hover:text-primary-foreground rounded-full transition-colors cursor-pointer">
							<Search size={24} />
						</button>
					</Link>
					<DropdownMenu>
						<DropdownMenuTrigger className="md:mt-auto" asChild>
							{user.avatarUrl ? (
								<Image
									width={48}
									height={48}
									src={user.avatarUrl}
									alt={user.username}
									className="h-12 w-12 rounded-2xl border-4 border-slate-950 object-cover shadow-xl bg-slate-900"
								/>
							) : (
								<div className="flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-slate-950 bg-linear-to-br from-primary/80 to-primary font-bold text-slate-950 text-lg shadow-xl">
									{user.username?.charAt(0).toUpperCase()}
								</div>
							)}
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start" className="w-40">
							<DropdownMenuGroup>
								<Link href={`/profile/${user._id}`}>
									<DropdownMenuItem>
										<User />
										Profile
									</DropdownMenuItem>
								</Link>
								<DropdownMenuSeparator />
								<DropdownMenuItem variant="destructive" onClick={logout}>
									<LogOut />
									Logout
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>

					{/* <Link href={`/profile/${user._id}`} className="mt-auto">
					</Link> */}
				</SidebarContent>
			</Sidebar>
		</>
	);
};
