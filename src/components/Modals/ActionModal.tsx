import React, { MouseEventHandler, useEffect, useRef, useState } from "react";
import { BiCheck } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";
import { VscLoading } from "react-icons/vsc";

function ActionModal({
	action,
	postId,
	postTitle,
	isActionPending,
	onAction,
}: {
	action: "publish" | "unpublish" | "delete";
	postId: number;
	postTitle: string;
	isActionPending: boolean;
	onAction: () => void;
}) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [actionStarted, setActionStarted] = useState(false);

	useEffect(() => {
		if (actionStarted && !isActionPending && inputRef.current) {
			inputRef.current.checked = false;
			setActionStarted(false);
		}
	}, [isActionPending]);

	return (
		<>
			<input
				type="checkbox"
				name=""
				id={`${action}-${postId}`}
				ref={inputRef}
				className="modal-input"
			/>

			<div className="modal-box bg-black/80 backdrop-blur-sm">
				<div className="flex gap-2">
					<span className="text-gray-300 capitalize">{action}</span>
					<span className="font-bold text-gray-100">
						{postTitle} ?
					</span>
					<button
						className="p-1 rounded-full hover:bg-gray-700"
						onClick={() => {
							setActionStarted(true);
							onAction();
						}}
					>
						{isActionPending ? (
							<VscLoading className="animate-spin" />
						) : (
							<BiCheck />
						)}
					</button>
					<label
						htmlFor={`${action}-${postId}`}
						className="p-1 rounded-full hover:bg-gray-700"
					>
						<IoMdClose />
					</label>
				</div>
			</div>
		</>
	);
}

export default ActionModal;
