import React from "react";
import PostControl from "./components/PostControl";
import PostTypeContextProvider, {
	PostTypeTogglerProps,
} from "./components/PostTypeContext";
import PostTypeToggler from "./components/PostTypeToggler";
import SearchComponent from "./components/SearchComponent";

function ProfilePostsLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { id: string };
}) {
	return (
		<PostTypeContextProvider>
			<div className="w-full flex flex-col gap-4 h-full overflow-hidden relative">
				<div className="flex  justify-between gap-2">
					<div className="flex justify-start gap-2 mr-4 self-end">
						<PostControl />
					</div>
					<div className="grow">
						<SearchComponent id={params.id} />
					</div>
				</div>
				<div className="overflow-y-auto grow">
					{/* <PostTypeToggler {...props} /> */}
					{children}
				</div>
			</div>
		</PostTypeContextProvider>
	);
}

export default ProfilePostsLayout;
