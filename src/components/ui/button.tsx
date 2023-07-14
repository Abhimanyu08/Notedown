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
				"flex rounded-md items-center bg-button hover:bg-hover active:scale-95 transition-all duration-100",
				className
			)}
			{...props}
		>
			{children}
		</button>
	);
}

export default Button;
