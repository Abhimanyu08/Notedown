"use client";
import { cn } from "@/lib/utils";
import { usePathname, useSelectedLayoutSegment } from "next/navigation";
import React from "react";

function PostPreviewLayout({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	// let className = "";
	const parallelLayout = useSelectedLayoutSegment("postpreview");
	const pathname = usePathname();

	return (
		<>
			{parallelLayout === "(...)post" && pathname?.includes("/post") && (
				<div key={pathname} className={cn(className)}>
					{children}
				</div>
			)}
		</>
	);
}

export default PostPreviewLayout;
