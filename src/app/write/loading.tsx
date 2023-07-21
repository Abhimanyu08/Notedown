import PostLoading from "@components/BlogPostComponents/PostLoading";
import React from "react";

function Loading() {
	return (
		<div className="flex flex-row grow">
			<div className="basis-1/2 border-r-[1px] border-border pt-10">
				<div className="flex flex-col h-full gap-4 px-10 pb-4">
					<div className="basis-6 animate-pulse w-full bg-gray-800 rounded-md"></div>
					<div className="grow animate-pulse w-full bg-gray-800 rounded-md"></div>
				</div>
			</div>
			<div className="basis-1/2 pt-10">
				<PostLoading />
			</div>
		</div>
	);
}

export default Loading;
