import React from "react";

function PostLoading() {
	return (
		<div className="flex flex-col h-full gap-4 px-10 pb-4 [&>*]:w-[65ch] items-center">
			<div className="basis-10 animate-pulse  bg-gray-800 rounded-md"></div>
			<div className="basis-6 animate-pulse bg-gray-800 rounded-md"></div>
			<div className="grow animate-pulse bg-gray-800 rounded-md"></div>
		</div>
	);
}

export default PostLoading;
