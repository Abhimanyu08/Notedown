"use client";
import { useContext } from "react";
import { PostTypeContext, PostTypeTogglerProps } from "./PostTypeContext";

function PostTypeToggler(props: PostTypeTogglerProps) {
	const { postType } = useContext(PostTypeContext);

	return <>{props[postType]}</>;
}

export default PostTypeToggler;
