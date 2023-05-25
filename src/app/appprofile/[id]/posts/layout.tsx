import React from "react";
import PostControl from "./components/PostControl";
import PostTypeContextProvider, {
	PostTypeTogglerProps,
} from "./components/PostTypeContext";
import PostTypeToggler from "./components/PostTypeToggler";
import SearchComponent from "./components/SearchComponent";

function ProfilePostsLayout(
	props: PostTypeTogglerProps & { params: { id: string } }
) {
	return (
		<PostTypeContextProvider>
			<div className="w-full flex flex-col gap-4 h-full overflow-hidden">
				<div className="flex  justify-between gap-2">
					<div className="flex justify-start gap-2 mr-4 self-end">
						<PostControl />
					</div>
					<div className="grow">
						<SearchComponent id={props.params.id} />
					</div>
				</div>
				<div className="grow overflow-y-auto ">
					<PostTypeToggler {...props} />
				</div>
			</div>
		</PostTypeContextProvider>
	);
}

export default ProfilePostsLayout;
