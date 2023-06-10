import React from "react";
import PostControl from "./components/PostControl";

function ProfilePostsLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { id: string };
}) {
	return (
		<div className="w-full flex flex-col gap-4 h-full overflow-hidden relative pr-10">
			<div className="flex  justify-between gap-2">
				<div className="flex justify-start gap-2 mr-4 self-end">
					<PostControl />
				</div>
				<label
					className="rounded-md flex justify-between w-44 items-center px-3 py-2 border-[1px] border-gray-500 text-xs text-gray-500"
					htmlFor="search"
				>
					<span>Search</span>
					<span>Alt+K</span>
				</label>
			</div>
			<div className="overflow-y-auto grow">
				{/* <PostTypeToggler {...props} /> */}
				{children}
			</div>
		</div>
	);
}

export default ProfilePostsLayout;
