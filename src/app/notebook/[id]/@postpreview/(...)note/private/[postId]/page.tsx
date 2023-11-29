import PostPreview from "@/app/notebook/[id]/components/PostPreviewComponents/PostPreview";

function PrivatePostModal({ params }: { params: { postId: string } }) {
	console.log("Params =======================>", params);
	return <PostPreview postId={params.postId} />;
}

export default PrivatePostModal;
