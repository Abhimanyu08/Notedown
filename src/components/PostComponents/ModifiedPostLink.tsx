"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

function ModifiedPostLink({
	children,
	...props
}: Parameters<typeof Link>["0"]) {
	const pathname = usePathname();
	return (
		<Link {...props} replace={!pathname?.startsWith("/notebook")}>
			{children}
		</Link>
	);
}

export default ModifiedPostLink;
