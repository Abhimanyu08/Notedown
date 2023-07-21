import React from "react";

function PostLoading() {
	return (
		<div className="flex flex-col h-full gap-4 px-10 pb-4">
			<div className="basis-10 animate-pulse w-1/2 bg-gray-800 rounded-md"></div>
			<div className="basis-6 animate-pulse w-full bg-gray-800 rounded-md"></div>
			<div className="grow animate-pulse w-full bg-gray-800 rounded-md"></div>
		</div>
	);
}

export default PostLoading;
