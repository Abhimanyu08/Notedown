import PostPreview from "../../../../../../../components/PostPreviewComponents/PostPreview";

function PrivatePostModal({ params }: { params: { postId: string } }) {
	/* @ts-expect-error Async Server Component  */
	return <PostPreview postId={params.postId} />;
}

export default PrivatePostModal;
