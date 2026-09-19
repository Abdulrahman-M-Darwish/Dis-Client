import { AppSidebar } from "@/components/AppSidebar";
import { SocketProvider } from "@/components/SocketContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UserProvider } from "@/components/UserProvider";
import React from "react";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<SidebarProvider>
			<div className="flex min-h-svh w-full min-w-0 flex-1 flex-col md:flex-row">
				<UserProvider>
					<SocketProvider>
						<AppSidebar />
						{children}
					</SocketProvider>
				</UserProvider>
			</div>
		</SidebarProvider>
	);
};

export default AppLayout;
