"use client";
import { ToastContext } from "@/contexts/ToastProvider";
import React, { useContext, useEffect, useState } from "react";

function ToastDisplay() {
	const context = useContext(ToastContext);

	const { message, setMessage } = context!;

	const [messageToShow, setMessageToShow] = useState("");

	useEffect(() => {
		if (message) {
			setMessageToShow(message);
			setTimeout(() => {
				setMessage("");
			}, 2000);
		}
	}, [message]);

	return (
		<div
			className={`toast font-mono fixed bottom-4 right-4 text-gray-200 border-[1px] border-gray-100 rounded-sm p-4 ${
				message ? "opacity-100" : "opacity-0"
			} transition-opacity duration-500`}
		>
			{messageToShow}
		</div>
	);
}

export default ToastDisplay;
