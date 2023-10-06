import { cn } from "@/lib/utils";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { Button } from "@components/ui/button";
import { langToExtension } from "@utils/constants";
import React from "react";

export function CodeBlock({
	children,
	className,
}: React.ComponentPropsWithoutRef<"div">) {
	return (
		<div className={cn("flex flex-col w-full", className)}>{children}</div>
	);
}

export function CodeBlockButtons({
	children,
	className,
	language,
	file,
}: React.ComponentPropsWithoutRef<"div"> & { language: string; file: string }) {
	return (
		<div className="flex justify-between">
			<span className="border-2 border-b-0 py-1 px-3 font-mono text-sm rounded-t-md bg-[#15181c] text-cyan-400">
				{file.includes(".") && language
					? file
					: `${file}${
							langToExtension[
								language as keyof typeof langToExtension
							]
					  }`}
			</span>
			<div
				className={cn(
					"flex flex-row gap-10 w-fit  border-2 z-20 border-b-0 border-border bg-[#15181c] py-1 px-3 rounded-t-md",
					className
				)}
			>
				{children}
			</div>
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
			align="center"
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
