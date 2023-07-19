import BlogContextProvider from "@components/BlogPostComponents/BlogState";
import { getPost } from "@/app/utils/getData";
import { Database } from "@/interfaces/supabase";
import Blog from "@components/BlogPostComponents/Blog";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";
import { SUPABASE_POST_TABLE } from "@utils/constants";
import { revalidatePath } from "next/cache";
import PublishModal from "@components/Modals/PublishModal";
import BlogAuthorServer from "@components/BlogPostComponents/BlogAuthorServer";
import {
	Preview,
	BackButton,
	ExpandButton,
	Edit,
} from "@/app/profile/[id]/components/ModalButtons";
import PostPreview from "../../../components/PostPreview";

function PrivatePostModal({ params }: { params: { postId: string } }) {
	/* @ts-expect-error Async Server Component  */
	return <PostPreview postId={params.postId} privatePost={true} />;
}

export default PrivatePostModal;
