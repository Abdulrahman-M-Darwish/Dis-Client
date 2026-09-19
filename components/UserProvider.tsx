"use client";

import { useAppDispatch, useAppSelector } from "@/hooks";
import { useLazyGetMeQuery } from "@/store/api/users";
import { setUser } from "@/store/features/userSlice";
import { useEffect, ReactNode, memo } from "react";
import { useRouter } from "next/navigation";
import { isConnectionError } from "@/utils";

export const UserProvider = memo(({ children }: { children: ReactNode }) => {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const [getUser, { isLoading }] = useLazyGetMeQuery();
	const currentUser = useAppSelector((state) => state.user.user);

	useEffect(() => {
		const initializeAuth = async () => {
			if (currentUser) return; // User is already set, no need to fetch again
			try {
				const response = await getUser();
				if ("error" in response && isConnectionError(response.error)) {
					router.push("/failure");
					return;
				}
				if (response.data) {
					dispatch(setUser(response.data));
				} else {
					// Token might be expired, clear it
					localStorage.removeItem("accessToken");
				}
			} catch (error) {
				console.error("Failed to restore auth session:", error);
			}
		};

		initializeAuth();
	}, [currentUser, dispatch, getUser, router]);

	if (isLoading) return "Loading...";

	return children;
});

UserProvider.displayName = "UserProvider";
