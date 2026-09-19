import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/hooks";
import { useCancelOrDeclineRequestMutation } from "@/store/api/friends";
import { usersApi } from "@/store/api/users";
import { X } from "lucide-react";
import { useSearchParams } from "next/navigation";

export const CancelButton = ({
	requestId,
	relationship,
}: {
	requestId?: string;
	relationship: string;
}) => {
	const [cancelFriendRequest, { isLoading }] =
		useCancelOrDeclineRequestMutation();
	const dispatch = useAppDispatch();
	const searchParams = useSearchParams();
	const sendRequest = async () => {
		if (relationship === "SENT_PENDING" && requestId) {
			await cancelFriendRequest(requestId).unwrap();
		}

		dispatch(
			usersApi.util.updateQueryData(
				"searchUsers",
				`?search=${searchParams.get("q")}`,
				(draft) => {
					const userIndex = draft.findIndex((u) => u.requestId == requestId);
					if (userIndex == -1) return;
					draft[userIndex].relationship = "NONE";
				},
			),
		);
	};
	if (relationship !== "SENT_PENDING") return;
	return (
		<Button
			size="sm"
			variant="outline"
			disabled={isLoading}
			onClick={sendRequest}
			className="rounded-xl border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs gap-1.5 h-9 px-3 cursor-pointer"
		>
			<X className="w-3.5 h-3.5" />
			{isLoading ? "Canceling..." : "Cancel"}
		</Button>
	);
};
