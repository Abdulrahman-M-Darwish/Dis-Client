import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useUpdateMessageMutation } from "@/store/api/messages";
import { Message } from "@/types";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const EditConversationMessage = ({ message }: { message: Message }) => {
	const [text, setText] = useState(message.text);
	const [updateMessage] = useUpdateMessageMutation();
	const [isOpen, setIsOpen] = useState(false);
	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (text?.trim() == "" || text?.trim() == message.text) return;
		const { error } = await updateMessage({
			_id: message._id,
			text: text?.trim(),
		});
		if (error) {
			toast.error("Failed to Update Message Please try again", {
				className: "!bg-destructive/85",
			});
			setIsOpen(false);
			return;
		}
		setIsOpen(false);
	};
	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
					<Pencil className="!h-4 !w-4 mr-2" />
					Edit
				</DropdownMenuItem>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Message</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<Input
						type="text"
						placeholder="Edit Message"
						value={text}
						onChange={(e) => setText(e.target.value)}
					/>
				</form>
			</DialogContent>
		</Dialog>
	);
};
