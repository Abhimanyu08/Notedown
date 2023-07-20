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
import { AiFillEdit } from "react-icons/ai";
import { BsArrowsAngleExpand } from "react-icons/bs";
import { IoMdArrowBack } from "react-icons/io";
import { TbNews } from "react-icons/tb";
import { ToolTipComponent } from "../../../../components/ToolTipComponent";
import { cn } from "@/lib/utils";

export function ExpandButton({
	postId,
	privatePost,
	className,
}: {
	postId: number;
	privatePost: boolean;
	className?: string;
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
		<ToolTipComponent
			tip="Expand (E)"
			className={cn("text-gray-400", className)}
		>
			<a href={url}>
				<BsArrowsAngleExpand size={20} />
			</a>
		</ToolTipComponent>
	);
}
