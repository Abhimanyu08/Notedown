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
				"flex rounded-md items-center justify-center  text-white active:scale-95 transition-all duration-75",
				className
			)}
			{...props}
		>
			{children}
		</button>
	);
}

export default Button;
