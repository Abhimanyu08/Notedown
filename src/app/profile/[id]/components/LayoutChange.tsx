"use client";
import { cn } from "@/lib/utils";
import {
	usePathname,
	useSelectedLayoutSegment,
	useSelectedLayoutSegments,
} from "next/navigation";
import React from "react";
import { motion } from "framer-motion";

function LayoutChange({ children }: { children: React.ReactNode[] }) {
	// const pathname = usePathname();
	// let className = "";
	const parallelLayout = useSelectedLayoutSegment("postpreview");
	const layout = useSelectedLayoutSegments();
	console.log(parallelLayout, layout);

	return (
		<motion.div
			layout
			className={cn(
				"w-[640px] mx-auto grow flex flex-col mt-12  gap-4",
				parallelLayout === "(...)post"
					? "w-full grid grid-cols-2  grid-rows-1 "
					: ""
			)}
			style={{
				paddingLeft: "20px",
				paddingRight: "20px",
			}}
		>
			<div
				className={cn(
					parallelLayout === "(...)post"
						? "col-start-1 col-span-1 row-span-1 border-r-[1px] border-gray-600"
						: "grow flex flex-col"
				)}
			>
				{children[0]}
			</div>
			{parallelLayout === "(...)post" && (
				<div
					className={cn(
						parallelLayout === "(...)post"
							? "col-start-2 col-span-1 row-span-1 relative mt-8"
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
