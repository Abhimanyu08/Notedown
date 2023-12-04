"use client";
import modifyDraftAndPostLink from "@utils/modifyDraftAndPostLink";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";
import PostOnPreviewColor from "./PostOnPreviewColor";

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
	id?: number;
	tag?: string;
}) {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	let href = pathname + `?note=${slug || id}`;

	href = modifyDraftAndPostLink(href, searchParams, tag);

	return (
		<Link href={href} className={className}>
			{children}
			<PostOnPreviewColor href={href} />
		</Link>
	);
}

export default PostLink;
