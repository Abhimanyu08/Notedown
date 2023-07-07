"use client";
import { ToastContext } from "@/contexts/ToastProvider";
import React, { useContext, useEffect, useState } from "react";
import { VscLoading } from "react-icons/vsc";

function ToastDisplay() {
	const context = useContext(ToastContext);

	const { message, setMessage } = context!;

	const [messageToShow, setMessageToShow] = useState<string | JSX.Element>(
		""
	);

	useEffect(() => {
		if (message) {
			setMessageToShow(message);
			setTimeout(() => {
				setMessage("");
			}, 3000);
		}
	}, [message]);

	return (
		<div
			className={`toast font-mono fixed bottom-4 bg-black right-4 text-gray-200 border-[1px] border-gray-100 rounded-sm p-4 ${
				message
					? "translate-x-0 opacity-100"
					: "translate-x-full opacity-0"
			} transition-all  duration-500 z-[100]`}
		>
			{messageToShow}
		</div>
	);
}

export default ToastDisplay;
