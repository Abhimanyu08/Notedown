"use client";
import { ToastContext } from "@/contexts/ToastProvider";
import React, { useContext, useEffect, useState } from "react";
import { VscLoading } from "react-icons/vsc";

function ToastDisplay() {
	const context = useContext(ToastContext);

	const [show, setShow] = useState(false);
	if (!context) return <></>;
	const { message, setMessage } = context;

	useEffect(() => {
		setShow(true);
		setTimeout(() => {
			setShow(false);
		}, 3000);
	}, [message]);

	return (
		<div
			className={`toast fixed bottom-4 bg-black right-4 text-gray-200 border-[1px] border-gray-100 rounded-sm p-4 ${
				show
					? "translate-x-0 opacity-100"
					: "translate-x-full opacity-0"
			} transition-all  duration-500 z-[100]`}
		>
			{message}
		</div>
	);
}

export default ToastDisplay;
