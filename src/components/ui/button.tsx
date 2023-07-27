import { cn } from "@/lib/utils";
import React from "react";

function Button({
	children,
	className,
	...props
}: React.ComponentPropsWithoutRef<"button">) {
	return (
		<button
			className={cn(
				"flex rounded-md items-center justify-center px-2 py-1  active:scale-95",
				className
			)}
			{...props}
		>
			{children}
		</button>
	);
}

export default Button;
