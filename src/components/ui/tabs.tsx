"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function Tabs({ children, className }: React.ComponentPropsWithoutRef<"div">) {
	return <div className={cn("flex", className)}>{children}</div>;
}

export function TabChildren({
	children,
	className,
	active = false,
}: { active?: boolean } & React.ComponentPropsWithoutRef<"div">) {
	return (
		<div className={cn("relative", className)}>
			{children}
			{active && (
				<motion.div
					className="absolute w-full h-full top-0 left-0 border-b-[2px] border-gray-200 box-content z-10"
					layoutId="tab"
				></motion.div>
			)}
		</div>
	);
}

export default Tabs;
