import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/hooks";
import { useAcceptRequestMutation } from "@/store/api/friends";
import { usersApi } from "@/store/api/users";
import { Check } from "lucide-react";
import { useSearchParams } from "next/navigation";

export const AcceptButton = ({
	requestId,
	relationship,
}: {
	requestId?: string;
	relationship: string;
}) => {
	const dispatch = useAppDispatch();
	const [acceptFriendRequest, { isLoading }] = useAcceptRequestMutation();
	const searchParams = useSearchParams();
	const sendRequest = async () => {
		if (!requestId || relationship !== "RECEIVED_PENDING") return;
		await acceptFriendRequest(requestId).unwrap();

		dispatch(
			usersApi.util.updateQueryData(
				"searchUsers",
				"?search=" + searchParams.get("q")!,
				(draft) => {
					const userIndex = draft.findIndex((u) => u.requestId == requestId);
					if (userIndex == -1) return;
					draft[userIndex].relationship = "FRIEND";
				},
			),
		);
	};
	if (relationship !== "RECEIVED_PENDING") return;
	return (
		<Button
			size="sm"
			disabled={isLoading}
			onClick={sendRequest}
			className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 h-9 px-3.5 cursor-pointer shadow-md"
		>
			<Check className="w-4 h-4" />
			Accept
		</Button>
	);
};
