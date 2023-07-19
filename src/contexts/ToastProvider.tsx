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

export const ToastContext = createContext<
	| {
			message: string | JSX.Element;
			setMessage: Dispatch<SetStateAction<string | JSX.Element>>;
	  }
	| undefined
>(undefined);

export default function ToastProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [message, setMessage] = useState<string | JSX.Element>("");

	return (
		<ToastContext.Provider
			value={{
				message,
				setMessage,
			}}
		>
			{children}
			<ToastDisplay />
		</ToastContext.Provider>
	);
}
