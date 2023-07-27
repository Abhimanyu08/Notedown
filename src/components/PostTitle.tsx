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
			<HoverCardTrigger className="w-max">
				<div className="text-xl text-black underline decoration-transparent group-hover:decoration-gray-300 transition-all duration-100 underline-offset-2 dark:text-gray-200 break-words max-w-3/4">
					{title}{" "}
				</div>
			</HoverCardTrigger>
			{description && (
				<HoverCardContent className="w-max" side="right">
					<span>{description}</span>
				</HoverCardContent>
			)}
		</HoverCard>
	);
}

export default PostTitle;
