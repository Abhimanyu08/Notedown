import { cn } from "@/lib/utils";
import React, { useState } from "react";

function ExapandableCarouselContainer({
	children,
}: {
	children: React.ReactNode;
}) {
	const [expand, setExpand] = useState(false);
	return (
		<div
			className={cn(
				"flex flex-col cursor-zoom-in",
				expand &&
					"fixed top-0 left-0 w-full h-full [&>div]:h-full p-4 [&>div]:w-1/2 z-[2000] bg-black cursor-zoom-out"
			)}
			onClick={() => setExpand((p) => !p)}
		>
			{children}
		</div>
	);
}

export default ExapandableCarouselContainer;
