"use client";
import { useContext } from "react";
import { PostTypeContext, PostTypeTogglerProps } from "./PostTypeContext";
import { usePathname } from "next/navigation";

function PostTypeToggler(props: PostTypeTogglerProps) {
	const { postType } = useContext(PostTypeContext);

	const pathname = usePathname();
	if (pathname?.startsWith("/apppost")) return <>{props.postpreview}</>;
	return <>{props[postType]}</>;
}

export default PostTypeToggler;
