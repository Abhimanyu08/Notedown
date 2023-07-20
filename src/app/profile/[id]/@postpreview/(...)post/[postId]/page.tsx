import PostPreview from "../../components/PostPreview";
function PostModal({ params }: { params: { postId: string } }) {
	/* @ts-expect-error Async Server Component  */
	return <PostPreview postId={params.postId} />;
}

export default PostModal;
