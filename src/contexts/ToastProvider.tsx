"use client";
import ToastDisplay from "@components/ToastDisplay";
import {
	Dispatch,
	SetStateAction,
	createContext,
	useEffect,
	useState,
} from "react";
import { VscLoading } from "react-icons/vsc";

export const ToastContext = createContext<{
	message: string;
	setMessage: Dispatch<SetStateAction<string>>;
}>({ message: "", setMessage: () => null });

export default function ToastProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [message, setMessage] = useState<string>("");

	useEffect(() => {
		if (message) {
			setTimeout(() => {
				setMessage("");
			}, 2000);
		}
	}, [message]);

	return (
		<ToastContext.Provider
			value={{
				message,
				setMessage,
			}}
		>
			{children}
			<ToastDisplay message={message} />
		</ToastContext.Provider>
	);
}
