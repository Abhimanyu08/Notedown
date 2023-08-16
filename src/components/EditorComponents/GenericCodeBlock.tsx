import { cn } from "@/lib/utils";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { Button } from "@components/ui/button";
import React from "react";

export function CodeBlock({
	children,
	className,
}: React.ComponentPropsWithoutRef<"div">) {
	return (
		<div className={cn("flex flex-col w-full ", className)}>{children}</div>
	);
}

export function CodeBlockButtons({
	children,
	className,
}: React.ComponentPropsWithoutRef<"div">) {
	return (
		<div
			className={cn(
				"flex flex-row gap-10 w-fit self-end border-2 border-b-0 border-border bg-[#15181c] py-1 px-3 rounded-t-md",
				className
			)}
		>
			{children}
		</div>
	);
}

export const CodeBlockButton = ({
	children,
	tip,
	className,
	onClick,
}: {
	children: React.ReactNode;
	tip: string;
	className?: string;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) => {
	return (
		<ToolTipComponent
			tip={tip}
			side="top"
			className={cn(
				"text-cyan-400 hover:scale-110  py-0 active:scale-90 flex items-center",
				className
			)}
			onClick={onClick}
		>
			{children}
		</ToolTipComponent>
	);
};
