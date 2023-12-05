"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";

function ExpandableSvgContainer({ children }: { children: React.ReactNode }) {
	const [expand, setExpand] = useState(false);
	return (
		<div
			className={cn(
				"flex w-full flex-col aspect-[4/3] justify-center items-center ",
				expand && "fixed top-0 left-0 h-full z-[2000] bg-black"
			)}
			onClick={() => setExpand((p) => !p)}
		>
			{children}
		</div>
	);
}

export default ExpandableSvgContainer;
