"use client";
import React from "react";

export function ProfileButton({
	children,
	className,
	onClick,
}: {
	children: React.ReactNode;
	className: string;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) {
	return (
		<button
			// className="text-sm bg-gray-800 hover:scale-105 active:scale-95  px-3  py-1 border-black border-[1px] transition-[scale]
			// duration-200 rounded-md"
			className={"relative " + className}
			onClick={onClick}
		>
			{children}
		</button>
	);
}
