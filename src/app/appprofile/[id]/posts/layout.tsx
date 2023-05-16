import React from "react";
import PostControl from "./components/PostControl";
import PostTypeContextProvider, {
	PostTypeTogglerProps,
} from "./components/PostTypeContext";
import PostTypeToggler from "./components/PostTypeToggler";

function ProfilePostsLayout(props: PostTypeTogglerProps) {
	return (
		<div className="w-full flex flex-col gap-4 h-full overflow-hidden">
			<PostTypeContextProvider>
				<PostControl />
				<div className="grow overflow-y-auto ">
					<PostTypeToggler {...props} />
				</div>
			</PostTypeContextProvider>
		</div>
	);
}

export default ProfilePostsLayout;
