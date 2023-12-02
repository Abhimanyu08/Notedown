"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";

function PostLink({
	children,
	className,
	slug,
	id,
	tag,
}: {
	children: React.ReactNode;
	className: string;
	slug?: string;
	id?: string;
	tag?: string;
}) {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const href = searchParams?.has("showtag")
		? `${pathname}?showtag=${searchParams.get("showtag")}&note=${
				slug || id
		  }&tag=${tag}&q=${searchParams?.get("q")}`
		: `${pathname}?note=${slug || id}&tag=${tag}&q=${searchParams?.get(
				"q"
		  )}`;
	return (
		<Link href={href} className={className}>
			{children}
		</Link>
	);
}

export default PostLink;
