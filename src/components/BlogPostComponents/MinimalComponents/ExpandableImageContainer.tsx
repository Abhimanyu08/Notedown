"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";

function ExpandableImageContainer({ children }: { children: React.ReactNode }) {
	const [expand, setExpand] = useState(false);
	return (
		<div
			className={cn(
				"w-4/5 mb-4 mx-auto cursor-zoom-in",
				expand &&
					"fixed top-0 left-0 w-full h-full cursor-zoom-out  flex flex-col items-center [&>img]:w-1/2 justify-center [&>figcaption]:hidden z-[2000] backdrop-blur-md"
			)}
			onClick={() => setExpand((p) => !p)}
		>
			{children}
		</div>
	);
}

export default ExpandableImageContainer;
