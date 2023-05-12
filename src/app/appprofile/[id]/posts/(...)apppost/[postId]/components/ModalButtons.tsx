"use client";
import useShortCut from "@/hooks/useShortcut";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";
import { BsArrowsAngleExpand } from "react-icons/bs";
import { IoMdArrowBack } from "react-icons/io";

export function ExpandButton({ postId }: { postId: string }) {
	const port = process.env.NODE_ENV === "development" ? ":3000" : "";
	const url =
		window.location.protocol +
		"//" +
		window.location.hostname +
		port +
		`/apppost/${postId}`;

	return (
		<button className="dark:bg-gray-800 p-2 rounded-full relative group">
			<a href={url}>
				<BsArrowsAngleExpand size={14} />
			</a>
			<span
				className="absolute invisible group-hover:visible text-xs border-[1px] border-gray-800 top-10 w-max p-1 
			right-2 rounded-md"
			>
				Expand
			</span>
		</button>
	);
}

export function BackButton() {
	const router = useRouter();

	useShortCut({
		keys: ["Escape"],
		callback: () => router.back(),
	});

	return (
		<div className="relative group">
			<button
				onClick={() => router.back()}
				className="dark:bg-gray-800 p-2 rounded-full"
			>
				<IoMdArrowBack />
			</button>
			<span
				className="absolute invisible group-hover:visible text-xs border-[1px] border-gray-800 top-10 w-max p-1 
			right-2 rounded-md"
			>
				Back to Posts (Esc)
			</span>
		</div>
	);
}
