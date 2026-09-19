import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/hooks";
import { useUnfriendMutation } from "@/store/api/friends";
import { usersApi } from "@/store/api/users";
import { UserMinus } from "lucide-react";
import { useSearchParams } from "next/navigation";

export const UnfriendButton = ({
	userId,
	relationship,
}: {
	userId?: string;
	relationship: string;
}) => {
	const dispatch = useAppDispatch();
	const searchParams = useSearchParams();
	const [declineFriendRequest, { isLoading }] = useUnfriendMutation();
	const sendRequest = async () => {
		if (!userId || relationship !== "FRIEND") return;
		await declineFriendRequest(userId).unwrap();

		dispatch(
			usersApi.util.updateQueryData(
				"searchUsers",
				`?search=${searchParams.get("q")}`,
				(draft) => {
					const userIndex = draft.findIndex((u) => u._id == userId);
					if (userIndex == -1) return;
					draft[userIndex].relationship = "NONE";
				},
			),
		);
	};
	if (relationship !== "FRIEND") return;
	return (
		<Button
			size="sm"
			variant="outline"
			disabled={isLoading}
			onClick={sendRequest}
			className="rounded-xl border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs gap-1.5 h-9 px-3 cursor-pointer"
		>
			<UserMinus className="w-3.5 h-3.5" />
			{isLoading ? "Unfriending..." : "Unfriend"}
		</Button>
	);
};
