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
	type,
}: {
	action: "publish" | "unpublish" | "delete";
	postTitle: string;
	isActionPending: boolean;
	onAction: () => void;
	visible: boolean;
	onClose: () => void;
	type?: "post" | "draft";
}) {
	if (visible) {
		return (
			<div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
				<div className="flex flex-col items-center gap-2 text-center ">
					<div className="flex gap-2 flex-nowrap justify-center">
						<span
							className={`text-gray-300 capitalize ${
								action === "delete" && "text-rose-500"
							}`}
						>
							{action}
						</span>
						<span className="font-bold text-gray-100 max-w-[30%] truncate">
							{postTitle}
						</span>
						{action === "delete" &&
							(type === "post" ? (
								<span className="text-sky-400">
									from server?
								</span>
							) : (
								<span className="text-amber-400">
									from browser?
								</span>
							))}
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
					{action === "delete" &&
						(type === "post" ? (
							<p className="text-xs text-gray-300">{`Note will be deleted from the server, but will remain intact in your browser locally`}</p>
						) : (
							<p className="text-xs text-gray-300">{`Note will be deleted forever, obliterated out of existence, with no way of getting it back, proceed with caution!!!`}</p>
						))}
				</div>
			</div>
		);
	}

	return <></>;
}

export default ActionModal;
