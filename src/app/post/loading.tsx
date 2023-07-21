import PostLoading from "@components/BlogPostComponents/PostLoading";
import React from "react";

function Loading() {
	return (
		<div className="flex flex-row  pt-20 grow">
			<div
				className={`basis-1/5 flex-col overflow-y-auto justify-start gap-5 flex px-4 border-r-[1px] border-border
					`}
			>
				{Array.from({ length: 5 }).map((_, i) => {
					return (
						<div
							className="basis-6 w-full animate-pulse bg-gray-800 rounded-md"
							key={i}
						></div>
					);
				})}
			</div>
			<div className="basis-3/5">
				<PostLoading />
			</div>
			<div
				className={`basis-1/5 flex-col overflow-y-auto justify-start gap-5 flex px-4 
					pl-10 mt-20`}
			>
				{Array.from({ length: 3 }).map((_, i) => {
					return (
						<div
							className="h-10 w-10 animate-pulse bg-gray-800 rounded-full"
							key={i}
						></div>
					);
				})}
			</div>
		</div>
	);
}

export default Loading;
