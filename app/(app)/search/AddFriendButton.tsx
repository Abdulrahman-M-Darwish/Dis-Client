import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/hooks";
import { useSendRequestMutation } from "@/store/api/friends";
import { usersApi } from "@/store/api/users";
import { UserPlus } from "lucide-react";
import { useSearchParams } from "next/navigation";

export const AddFriendButton = ({
	userId,
	relationship,
}: {
	userId: string;
	relationship: string;
}) => {
	const dispatch = useAppDispatch();
	const searchParams = useSearchParams();
	const [sendFriendRequest, { isLoading }] = useSendRequestMutation();
	const sendRequest = async () => {
		if (relationship !== "NONE") return;
		const req = await sendFriendRequest(userId).unwrap();

		dispatch(
			usersApi.util.updateQueryData(
				"searchUsers",
				`?search=${searchParams.get("q")}`,
				(draft) => {
					const userIndex = draft.findIndex((u) => u._id == userId);
					if (userIndex == -1) return;
					draft[userIndex].relationship = "SENT_PENDING";
					draft[userIndex].requestId = req._id;
				},
			),
		);
	};
	if (relationship !== "NONE") return;
	return (
		<Button
			disabled={isLoading}
			size="sm"
			className={`rounded-xl text-xs gap-1.5 hover:brightness-110 transition cursor-pointer h-9 px-3 flex-1 sm:flex-initial bg-primary text-primary-foreground`}
			onClick={sendRequest}
		>
			<UserPlus className="w-3.5 h-3.5" />
			{isLoading ? "Adding Friend..." : "Add Friend"}
		</Button>
	);
};
