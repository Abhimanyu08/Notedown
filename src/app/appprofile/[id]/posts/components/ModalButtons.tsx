"use client";
import useShortCut from "@/hooks/useShortcut";
import { usePathname, useRouter } from "next/navigation";
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

	useShortCut({
		keys: ["e"],
		callback: () => {
			window.location.href = url;
		},
	});

	return (
		<button
			className="dark:bg-gray-800 p-2 rounded-full tooltip tooltip-bottom"
			data-tip="Expand (E)"
		>
			<a href={url}>
				<BsArrowsAngleExpand size={14} />
			</a>
		</button>
	);
}

export function BackButton({ id }: { id: string }) {
	const router = useRouter();

	useShortCut({
		keys: ["Escape"],
		callback: () => {
			console.log("calling backbutton shortcut");
			router.push(`/appprofile/${id}/posts`);
		},
	});

	return (
		<button
			onClick={() => router.back()}
			className="dark:bg-gray-800 p-2 rounded-full tooltip tooltip-bottom"
			data-tip="Back to Posts(Esc)"
		>
			<IoMdArrowBack size={16} />
		</button>
	);
}
