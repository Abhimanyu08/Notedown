"use client";
import { cn } from "@/lib/utils";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@components/ui/tooltip";

export function ToolTipComponent({
	children,
	tip,
	side,
	align,
	className,
	...props
}: React.ComponentPropsWithoutRef<"button"> & {
	tip: string;
	side?: "left" | "top" | "right" | "bottom";
	align?: "center" | "end" | "start";
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
				<TooltipContent
					align={align || "start"}
					side={side || "left"}
					className="border-border font-sans"
				>
					{tip}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
