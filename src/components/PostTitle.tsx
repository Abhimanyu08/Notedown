import React from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";

function PostTitle({
	title,
	description,
}: {
	title: string;
	description?: string;
}) {
	return (
		<HoverCard>
			<HoverCardTrigger className="w-fit">
				<div className="text-xl text-black font-semibold group-hover:underline group-hover:underline-offset-2 tracking-wide font-serif group-hover:italic  dark:text-gray-200 break-words max-w-3/4">
					{title}{" "}
				</div>
			</HoverCardTrigger>
			{description && (
				<HoverCardContent className="bg-slate-800" align="start">
					{description}
				</HoverCardContent>
			)}
		</HoverCard>
	);
}

export default PostTitle;
