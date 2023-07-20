import React, { MouseEventHandler, useEffect, useRef, useState } from "react";
import { BiCheck } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";
import { VscLoading } from "react-icons/vsc";

function ActionModal({
	action,
	postTitle,
	isActionPending,
	onAction,
	visible,
	onClose,
}: {
	action: "publish" | "unpublish" | "delete";
	postTitle: string;
	isActionPending: boolean;
	onAction: () => void;
	visible: boolean;
	onClose: () => void;
}) {
	return (
		<>
			{visible && (
				<div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
					<div className="flex gap-2">
						<span className="text-gray-300 capitalize">
							{action}
						</span>
						<span className="font-bold text-gray-100">
							{postTitle} ?
						</span>
						<button
							className="p-1 rounded-full hover:bg-gray-700"
							onClick={() => {
								onAction();
							}}
						>
							{isActionPending ? (
								<VscLoading className="animate-spin" />
							) : (
								<BiCheck />
							)}
						</button>
						<button
							className="p-1 rounded-full hover:bg-gray-700"
							onClick={() => onClose()}
						>
							<IoMdClose />
						</button>
					</div>
				</div>
			)}
		</>
	);
}

export default ActionModal;
