import { cn } from "@/lib/utils";
import React from "react";

function Divider({
	children,
	horizontal = true,
	className,
	...props
}: { horizontal?: boolean } & React.ComponentPropsWithoutRef<"div">) {
	let flexDirection = "flex-row";
	if (!horizontal) flexDirection = "flex-col";
	return (
		<div
			className={cn(
				"flex gap-2",
				"before:grow before:self-center before:h-0 before:border-[1px] before:border-border",
				"after:grow after:self-center after:h-0 after:border-[1px] after:border-border",
				flexDirection,
				className
			)}
			{...props}
		>
			{children}
		</div>
	);
}

export default Divider;
