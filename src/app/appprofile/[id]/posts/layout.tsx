import React from "react";
import PostControl from "./components/PostControl";
import PostTypeContextProvider, {
	PostTypeTogglerProps,
} from "./components/PostTypeContext";
import PostTypeToggler from "./components/PostTypeToggler";

function ProfilePostsLayout(
	props: PostTypeTogglerProps & { children: React.ReactNode }
) {
	return (
		<div className="w-full flex flex-col gap-4">
			<PostTypeContextProvider>
				<PostControl />
				<PostTypeToggler {...props} />
			</PostTypeContextProvider>
		</div>
	);
}

export default ProfilePostsLayout;
