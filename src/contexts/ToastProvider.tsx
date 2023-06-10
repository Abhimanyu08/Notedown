"use client";
import { Dispatch, SetStateAction, createContext, useState } from "react";

export const ToastContext = createContext<
	| { message: string; setMessage: Dispatch<SetStateAction<string>> }
	| undefined
>(undefined);

export default function ToastProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [message, setMessage] = useState("");

	return (
		<ToastContext.Provider
			value={{
				message,
				setMessage,
			}}
		>
			{children}
		</ToastContext.Provider>
	);
}
