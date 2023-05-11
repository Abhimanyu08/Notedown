import React from "react";

function PostsLoading() {
	return (
		<div className="flex flex-col gap-10">
			{Array.from({ length: 4 }).map(() => (
				<SinglePostLoading />
			))}
		</div>
	);
}

function SinglePostLoading() {
	return (
		<div className="flex flex-col gap-3 [&>*]:animate-pulse">
			<div className="w-72 bg-gray-800 h-6 rounded-sm"></div>
			<div className="flex w-96  [&>*]:mr-2 [&>*]:my-1 [&>*]:grow">
				<div className=" bg-gray-800 h-3 rounded-sm"></div>
				<div className=" bg-gray-800 h-3 rounded-sm"></div>
				<div className=" bg-gray-800 h-3 rounded-sm"></div>
				<div className=" bg-gray-800 h-3 rounded-sm"></div>
			</div>
			<div className="w-80 bg-gray-800 h-4 rounded-sm"></div>
		</div>
	);
}

export default PostsLoading;
