"use client";
import { cn } from "@/lib/utils";
import { usePathname, useSelectedLayoutSegment } from "next/navigation";
import React from "react";
import { motion } from "framer-motion";

function LayoutChange({ children }: { children: React.ReactNode[] }) {
	// const pathname = usePathname();
	// let className = "";
	const layout = useSelectedLayoutSegment("postpreview");
	console.log(layout);

	return (
		<motion.div
			layout
			className={cn(
				"w-[640px] mx-auto py-10 h-full flex flex-col  gap-4",
				layout === "(...)post"
					? "w-full grid grid-cols-2 grid-rows-1"
					: ""
			)}
		>
			<div
				className={cn(
					layout === "(...)post"
						? "col-start-1 col-span-1 row-span-1"
						: "grow"
				)}
			>
				{children[0]}
			</div>
			{layout === "(...)post" && (
				<div
					className={cn(
						layout === "(...)post"
							? "col-start-2 col-span-1 row-span-1"
							: ""
					)}
				>
					{children[1]}
				</div>
			)}
		</motion.div>
	);
}

export default LayoutChange;
