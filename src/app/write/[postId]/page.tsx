import { getPost } from "@utils/getData";
import { Database } from "@/interfaces/supabase";
import { cookies, headers } from "next/headers";
import EditorLayout from "../components/EditorLayout";
import { createSupabaseServerClient } from "@utils/createSupabaseClients";

async function EditPost({ params }: { params: { postId: string } }) {
	const supabase = createSupabaseServerClient(cookies);

	const { post, imagesToUrls, markdown, fileNames } = await getPost(
		params.postId,
		supabase
	);

	return <EditorLayout {...{ post, markdown, imagesToUrls, fileNames }} />;
}

export default EditPost;
