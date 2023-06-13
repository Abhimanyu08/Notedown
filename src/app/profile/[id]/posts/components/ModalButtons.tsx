"use client";
import useShortCut from "@/hooks/useShortcut";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MouseEventHandler } from "react";
import { AiFillEdit } from "react-icons/ai";
import { BsArrowsAngleExpand } from "react-icons/bs";
import { IoMdArrowBack } from "react-icons/io";
import { TbNews } from "react-icons/tb";

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
		(privatePost ? `/post/private/${postId}` : `/post/${postId}`);

	useShortCut({
		keys: ["e"],
		callback: () => {
			window.location.href = url;
		},
	});

	return (
		<PostPreviewButton tip="Expand (E)" className="tooltip-left">
			<a href={url}>
				<BsArrowsAngleExpand size={14} />
			</a>
		</PostPreviewButton>
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
		<PostPreviewButton
			onClick={() => router.back()}
			tip="Back to Posts(Esc)"
			className="tooltip-left"
		>
			<IoMdArrowBack size={16} />
		</PostPreviewButton>
	);
}

export function Preview() {
	return (
		<label
			htmlFor="private-publish"
			className="dark:bg-gray-800 p-2 rounded-full tooltip tooltip-bottom hover:scale-105 active:scale-95"
			data-tip="Publish"
		>
			<TbNews className=" dark:text-white text-black" size={14} />
		</label>
	);
}
export function Edit({ postId }: { postId: number }) {
	return (
		<PostPreviewButton tip="Edit">
			<Link href={`/write/${postId}`}>
				<AiFillEdit size={14} className="dark:text-white  text-black" />
			</Link>
		</PostPreviewButton>
	);
}

function PostPreviewButton({
	children,
	tip,
	onClick,
	className,
}: {
	children: React.ReactNode;
	tip: string;
	onClick?: MouseEventHandler;
	className?: string;
}) {
	return (
		<button
			data-tip={tip}
			onClick={onClick}
			className={
				"dark:bg-gray-800 p-2 rounded-full tooltip tooltip-bottom " +
				` ${className}`
			}
		>
			{children}
		</button>
	);
}
