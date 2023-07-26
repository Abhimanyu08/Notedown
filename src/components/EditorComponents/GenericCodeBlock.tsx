import { cn } from "@/lib/utils";
import { ToolTipComponent } from "@components/ToolTipComponent";
import Button from "@components/ui/button";
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
				"flex flex-row  gap-5 w-fit self-end border-[1px] border-b-0 border-white/50 bg-[#15181c] py-1 px-3 rounded-t-md",
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
		<ToolTipComponent tip={tip} side="top">
			<Button
				className={
					"text-cyan-400 hover:scale-110 active:scale-90 " +
						className || ""
				}
				onClick={onClick}
			>
				{children}
			</Button>
		</ToolTipComponent>
	);
};
