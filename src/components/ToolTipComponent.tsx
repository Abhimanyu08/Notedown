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
	className,
	...props
}: React.ComponentPropsWithoutRef<"button"> & { tip: string }) // {

// 	children: React.ReactNode;
// 	tip: string;
// 	onClick?: MouseEventHandler;
// 	className?: string;
// }
{
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger {...props} className={cn(className)}>
					{children}
				</TooltipTrigger>
				<TooltipContent align={"start"} side={"left"}>
					{tip}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
