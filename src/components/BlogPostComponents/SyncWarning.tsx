"use client";
import useInSync from "@/hooks/useInSync";
import { AlertCircle, AlertTriangle } from "lucide-react";

import React, { useContext } from "react";
import { BlogContext } from "./BlogState";
import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

function SyncWarning({ markdown }: { markdown?: string }) {
	const inSync = useInSync({ markdown });
	const pathname = usePathname();
	const params = useParams();
	const searchParams = useSearchParams();
	const { blogState } = useContext(BlogContext);
	const { blogMeta } = blogState;

	function getHref() {
		if (!searchParams) return;
		if (pathname?.startsWith("/notebook")) {
			if (searchParams?.has("note")) {
				return `${pathname}?draft=${
					blogMeta.timeStamp
				}&synced=false&noteId=${searchParams.get(
					"note"
				)}&tag=${searchParams.get("tag")}`;
			}
			return `${pathname}?note=${searchParams.get(
				"noteId"
			)}&tag=${searchParams.get("tag")}`;
		}

		if (pathname?.startsWith("/note")) {
			return `/draft/${blogMeta.timeStamp}?synced=false&noteId=${params?.postId}`;
		}
		return `/note/${searchParams.get("noteId")}?synced=false`;
	}

	const onLocal =
		pathname?.startsWith("/draft") || searchParams?.has("draft");

	if (inSync) {
		return <></>;
	}
	if (onLocal && !searchParams?.has("synced")) {
		return <></>;
	}

	return (
		<div className="flex gap-1 not-prose items-center text-xs bg-destructive text-black p-2 w-fit rounded-md">
			<span>The</span>
			<Link
				href={
					onLocal
						? `${pathname}?${searchParams?.toString()}`
						: getHref()!
				}
				className={cn(
					"underline hover:italic",
					onLocal ? "text-gray-100" : ""
				)}
			>
				local
			</Link>
			<span>and</span>
			<Link
				href={
					!onLocal
						? `${pathname}?${searchParams?.toString()}`
						: getHref()!
				}
				className={cn(
					"underline hover:italic",
					!onLocal ? "text-gray-100" : ""
				)}
			>
				uploaded
			</Link>
			<span>versions are not synced</span>
		</div>
	);
}

export default SyncWarning;
