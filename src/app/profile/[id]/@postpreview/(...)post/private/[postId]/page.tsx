import PostPreview from "../../../../../../../components/PostPreviewComponents/PostPreview";

function PrivatePostModal({ params }: { params: { postId: string } }) {
	return <PostPreview postId={params.postId} />;
}

export default PrivatePostModal;
