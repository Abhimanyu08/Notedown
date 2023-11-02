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
				<h2 className="text-black font-sans underline  decoration-transparent group-hover:decoration-gray-300 transition-all duration-100 underline-offset-2 dark:text-gray-300 break-words max-w-3/4">
					{title}{" "}
				</h2>
			</HoverCardTrigger>
			{/* <HoverCardContent
				className="border-border text-sm w-max"
				side="bottom"
				align="start"
			>
				<span>
					{description ||
						"No description, gotta open to read what's inside"}
				</span>
			</HoverCardContent> */}
		</HoverCard>
	);
}

export default PostTitle;
