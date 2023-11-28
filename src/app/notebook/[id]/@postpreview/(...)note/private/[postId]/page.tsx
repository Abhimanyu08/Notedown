import PostPreview from "@/app/notebook/[id]/components/PostPreviewComponents/PostPreview";

function PrivatePostModal({ params }: { params: { postId: string } }) {
	return <PostPreview postId={params.postId} />;
}

export default PrivatePostModal;
