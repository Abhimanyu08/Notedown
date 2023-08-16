import PostPreview from "../../../../../../components/PostPreviewComponents/PostPreview";
function PostModal({ params }: { params: { postId: string } }) {
	return <PostPreview postId={params.postId} />;
}

export default PostModal;
