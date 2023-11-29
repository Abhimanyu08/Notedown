import PostPreview from "@/app/notebook/[id]/components/PostPreviewComponents/PostPreview";
import { redirect } from "next/navigation";

function PostModal({ params }: { params: { id: string; postId: string } }) {
	if (params.postId === "null") {
		redirect(`/notebook/${params.id}`);
	}
	return <PostPreview postId={params.postId} />;
}

export default PostModal;
