import { getPost } from "@/app/utils/getData";
import { Database } from "@/interfaces/supabase";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";
import EditorLayout from "../components/EditorLayout";

async function EditPost({ params }: { params: { postId: string } }) {
	const supabase = createServerComponentSupabaseClient<Database>({
		headers,
		cookies,
	});

	const { post, content, imagesToUrls, markdown } = await getPost(
		params.postId,
		supabase
	);

	return <EditorLayout {...{ post, content, markdown, imagesToUrls }} />;
}

export default EditPost;
