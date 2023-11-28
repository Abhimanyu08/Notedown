import PostPreview from "@/app/notebook/[id]/components/PostPreviewComponents/PostPreview";

function PostModal({ params }: { params: { postId: string } }) {
	return <PostPreview postId={params.postId} />;
}

export default PostModal;
