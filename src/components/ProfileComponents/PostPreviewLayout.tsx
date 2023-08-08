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
	const pathname = usePathname();

	return (
		<>
			{(pathname?.startsWith("/post") ||
				pathname?.startsWith("/draft")) && (
				<div key={pathname} className={cn(className)}>
					{children}
				</div>
			)}
		</>
	);
}

export default PostPreviewLayout;
