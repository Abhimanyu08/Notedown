import { getPostMarkdown } from "@/app/utils/getPostMarkdown";
import { Blog } from "@components/BlogPostComponents/Blog";
import React from "react";
import { BackButton, ExpandButton } from "./components/ModalButtons";

async function PostModal({ params }: { params: { postId: string } }) {
	const { content, post } = await getPostMarkdown(params.postId);
	return (
		<div className="flex flex-col items-center justify-center h-full w-full relative">
			<Blog {...{ ...post, content }} extraClasses="w-full" />
			<div className="flex absolute gap-3 top-2 right-3">
				<ExpandButton postId={params.postId} />
				<BackButton />
			</div>
		</div>
	);
}

export default PostModal;
