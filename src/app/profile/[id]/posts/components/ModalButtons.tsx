"use client";
import useShortCut from "@/hooks/useShortcut";
import { useRouter } from "next/navigation";
import { BsArrowsAngleExpand } from "react-icons/bs";
import { IoMdArrowBack } from "react-icons/io";

export function ExpandButton({
	postId,
	privatePost,
}: {
	postId?: string;
	privatePost?: boolean;
}) {
	const port = process.env.NODE_ENV === "development" ? ":3000" : "";
	const url =
		window.location.protocol +
		"//" +
		window.location.hostname +
		port +
		privatePost
			? `/post/private/${postId}`
			: `/post/${postId}`;

	useShortCut({
		keys: ["e"],
		callback: () => {
			window.location.href = url;
		},
	});

	return (
		<button
			className="dark:bg-gray-800 p-2 rounded-full tooltip tooltip-bottom tooltip-left"
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
			router.back();
		},
	});

	return (
		<button
			onClick={() => router.back()}
			className="dark:bg-gray-800 p-2 rounded-full tooltip tooltip-bottom tooltip-left"
			data-tip="Back to Posts(Esc)"
		>
			<IoMdArrowBack size={16} />
		</button>
	);
}
