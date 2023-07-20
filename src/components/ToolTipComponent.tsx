"use client";
import { cn } from "@/lib/utils";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@components/ui/tooltip";
import { MouseEventHandler } from "react";

export function ToolTipComponent({
	children,
	tip,
	side,
	className,
	...props
}: React.ComponentPropsWithoutRef<"button"> & {
	tip: string;
	side?: "left" | "top" | "right" | "bottom";
}) {
	// {

	// 	children: React.ReactNode;
	// 	tip: string;
	// 	onClick?: MouseEventHandler;
	// 	className?: string;
	// }
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger {...props} className={cn(className)}>
					{children}
				</TooltipTrigger>
				<TooltipContent align={"start"} side={side || "left"}>
					{tip}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
