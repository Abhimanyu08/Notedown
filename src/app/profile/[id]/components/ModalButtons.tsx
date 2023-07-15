"use client";
import useShortCut from "@/hooks/useShortcut";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@components/ui/tooltip";
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
		<TooltipProvider>
			<Tooltip>
				<label
					htmlFor="private-publish"
					className="w-fit "
					data-tip="Publish"
				>
					<TooltipTrigger className="p-2 bg-slate-800 rounded-full">
						<TbNews
							className=" dark:text-white text-black"
							size={14}
						/>
					</TooltipTrigger>
				</label>
				<TooltipContent>publish</TooltipContent>
			</Tooltip>
		</TooltipProvider>
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
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger
					onClick={onClick}
					className="p-2 rounded-full bg-slate-800"
				>
					{children}
				</TooltipTrigger>
				<TooltipContent>{tip}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
