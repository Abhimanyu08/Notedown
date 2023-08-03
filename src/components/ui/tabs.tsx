"use client";
import React, { createContext, useContext } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const TabContext = createContext<{ layoutId?: string }>({ layoutId: "tabs" });
function Tabs({
	children,
	className,
	layoutId,
}: React.ComponentPropsWithoutRef<"div"> & { layoutId?: string }) {
	return (
		<TabContext.Provider value={{ layoutId }}>
			<div className={cn("flex", className)}>{children}</div>
		</TabContext.Provider>
	);
}

export function TabChildren({
	children,
	className,
	active = false,
}: { active?: boolean } & React.ComponentPropsWithoutRef<"div">) {
	const { layoutId } = useContext(TabContext);
	return (
		<div
			className={cn(
				"relative text-gray-400 hover:text-gray-100",
				className
			)}
		>
			{children}
			{active && (
				<motion.div
					className="absolute w-full h-full top-0 left-0 border-b-[2px] border-gray-200 box-content z-10"
					layoutId={layoutId || "tabs"}
				></motion.div>
			)}
		</div>
	);
}

export default Tabs;
