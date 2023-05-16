"use client";
import { useContext } from "react";
import { PostTypeContext, PostTypeTogglerProps } from "./PostTypeContext";
import { usePathname } from "next/navigation";
import PostComponent from "@components/PostComponent";

function PostTypeToggler(props: PostTypeTogglerProps) {
	const { postType, searchResults } = useContext(PostTypeContext);

	const pathname = usePathname();
	if (pathname?.startsWith("/apppost")) return <>{props.postpreview}</>;
	if (searchResults.length > 0) {
		return (
			<div className="flex flex-col gap-8">
				{searchResults.map((post, idx) => (
					<PostComponent key={idx} post={post} />
				))}
			</div>
		);
	}

	return <>{props[postType]}</>;
}

export default PostTypeToggler;
