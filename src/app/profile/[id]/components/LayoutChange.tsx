"use client";
import { cn } from "@/lib/utils";
import {
	useParams,
	usePathname,
	useSelectedLayoutSegment,
	useSelectedLayoutSegments,
} from "next/navigation";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";

function LayoutChange({ children }: { children: React.ReactNode[] }) {
	// const pathname = usePathname();
	// let className = "";
	const parallelLayout = useSelectedLayoutSegment("postpreview");
	const pathname = usePathname();

	return (
		<motion.div
			layout
			className={cn(
				"w-[700px] mx-auto grow flex flex-col my-12  gap-4",
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
					"grow flex flex-col gap-4",
					parallelLayout === "(...)post"
						? "col-start-1 col-span-1  row-span-1 border-r-[1px] border-gray-600"
						: ""
				)}
				style={{
					paddingLeft: "30px",
					paddingRight: "30px",
				}}
			>
				{children[0]}
			</div>
			{parallelLayout === "(...)post" && (
				<div
					key={pathname}
					className={cn(
						parallelLayout === "(...)post"
							? "col-start-2 col-span-1 row-span-1 relative mt-[10px]"
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
