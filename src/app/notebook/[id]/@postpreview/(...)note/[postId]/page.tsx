import PostPreview from "@/app/notebook/[id]/components/PostPreviewComponents/PostPreview";
import { redirect, permanentRedirect, RedirectType } from "next/navigation";

function PostModal({ params }: { params: { id: string; postId: string } }) {
	if (params.postId === "null") {
		permanentRedirect(`/notebook/${params.id}`, RedirectType.replace);
	}
	return <PostPreview postId={params.postId} />;
}

export default PostModal;
