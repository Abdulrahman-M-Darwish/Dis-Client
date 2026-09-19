import {
	EmojiPicker,
	EmojiPickerContent,
	EmojiPickerFooter,
	EmojiPickerSearch,
} from "@/components/ui/emoji-picker";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { FaceSlightlySmiling } from "lucide-react";
import { memo, useState } from "react";

type Props = {
	messageInput: string;
	setMessageInput: React.Dispatch<React.SetStateAction<string>>;
	inputRef: React.RefObject<HTMLInputElement | null>;
	disabled: boolean;
};

export const ConversationFormEmojiPicker = memo(
	({ inputRef, messageInput, setMessageInput, disabled }: Props) => {
		const [isOpen, setIsOpen] = useState(false);
		const handleEmojiSelect = ({ emoji }: { emoji: string }) => {
			if (!inputRef.current) return;
			// 1. Read current cursor position directly ''from DOM input element (most accurate)
			const selectionStart = inputRef.current.selectionStart || 0;
			const selectionEnd = inputRef.current.selectionEnd || 0;
			// 2. Calculate new text and exact new cursor index
			const beforeCursor = messageInput.slice(0, selectionStart);
			const afterCursor = messageInput.slice(selectionEnd);
			const updatedText = beforeCursor + emoji + afterCursor;
			const newCaretPosition = selectionStart + emoji.length;
			// 3. Update state
			setMessageInput(updatedText);
			// 4. Defer focus & selection setting until React updates the DOM input value
			requestAnimationFrame(() => {
				if (inputRef.current) {
					inputRef.current.focus();
					inputRef.current.setSelectionRange(
						newCaretPosition,
						newCaretPosition,
					);
				}
			});
		};
		return (
			<Popover open={isOpen}>
				<PopoverTrigger asChild>
					<button
						type="button"
						className="text-slate-400 hover:text-teal-400 transition-colors shrink-0 cursor-pointer"
						aria-label="Add Emoji"
						onClick={() => setIsOpen((p) => !p)}
						disabled={disabled}
					>
						<FaceSlightlySmiling id="icon-trigger" />
					</button>
				</PopoverTrigger>
				<PopoverContent
					className="w-fit p-0"
					onOpenAutoFocus={(e) => {
						e.preventDefault();
						requestAnimationFrame(() => {
							inputRef.current?.focus();
						});
					}}
					onCloseAutoFocus={(e) => {
						e.preventDefault();
						inputRef.current?.focus();
					}}
					onPointerDownOutside={(e) => {
						e.preventDefault();
						if (
							e.currentTarget == inputRef.current ||
							(e.currentTarget as SVGElement).id == "icon-trigger"
						)
							return;
						setIsOpen(false);
					}}
				>
					<EmojiPicker className="h-85.5" onEmojiSelect={handleEmojiSelect}>
						<EmojiPickerSearch />
						<EmojiPickerContent className="[&_button]:text-2xl [&_button]:h-10 [&_button]:w-10" />
						<EmojiPickerFooter />
					</EmojiPicker>
				</PopoverContent>
			</Popover>
		);
	},
);

ConversationFormEmojiPicker.displayName = "ConversationFormEmojiPicker";
