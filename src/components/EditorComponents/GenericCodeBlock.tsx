import { cn } from "@/lib/utils";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { Button } from "@components/ui/button";
import { useEditor } from "@tldraw/tldraw";
import { langToFileExtension } from "@utils/constants";
import themeToExtension from "@utils/themeToExtension";
import { EditorView } from "codemirror";
import React, { useEffect, useState } from "react";

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
	themeClasses,
}: React.ComponentPropsWithoutRef<"div"> & {
	language?: string;
	file?: string;
	themeClasses?: string;
}) {
	return (
		<div
			className={cn(
				themeClasses,
				"flex flex-row justify-between w-full border-2 items-center border-border border-b-0 py-1 px-3 rounded-t-md gap-8",
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
			align="center"
			className={cn(
				"hover:scale-110  py-0 active:scale-90 flex items-center",
				className
			)}
			onClick={onClick}
		>
			{children}
		</ToolTipComponent>
	);
};
