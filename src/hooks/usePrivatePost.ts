import { PostgrestError, User } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { SUPABASE_FILES_BUCKET, SUPABASE_POST_TABLE } from "../../utils/constants";
import { getHtmlFromMarkdown } from "../../utils/getResources";
import { supabase } from "../../utils/supabaseClient";
import { BlogProps } from "../interfaces/BlogProps";
import PostWithBlogger from "../interfaces/PostWithBlogger";

export default function usePrivatePostQuery({ postId, loggedInUser }: { postId: number, loggedInUser: User | null }): { data: Partial<BlogProps> | undefined; error: PostgrestError | Error | undefined; loading: boolean; } {
    const router = useRouter()
    const [privatePost, setPrivatePost] = useState<Partial<BlogProps>>();
    const [error, setError] = useState<PostgrestError | Error>();
    const [loading, setLoading] = useState(true);
    const fetch = useRef(true)

    useEffect(() => {
        if (!loggedInUser) {
            router.replace("/")
        }
        const fetchPost = async () => {
            const { data: createdByData } = await supabase.from<PostWithBlogger>(SUPABASE_POST_TABLE).select('id,created_by').eq("id", postId)

            if (createdByData?.at(0)?.created_by !== loggedInUser?.id) {
                router.replace("/")
                return
            }

            const { data, error } = await supabase.from<PostWithBlogger>(SUPABASE_POST_TABLE).select('id,created_by,title,description,language,published_on,filename,image_folder, bloggers(name)').eq("id", postId)
            if (error) {
                setError(error)
                setLoading(false)
                return
            }
            if (!data) {
                setError(new Error("data is null"))
                setLoading(false)
                return
            }
            if (data.length === 0) {
                setError(new Error(`no post found matching id: ${postId}`))
                setLoading(false)
                return
            }


            const post = data[0]

            if (post.created_by !== loggedInUser?.id) {
                router.replace("/")
                return
            }

            const { data: fileData, error: fileError } = await supabase.storage.from(SUPABASE_FILES_BUCKET).download(post.filename)

            if (fileError) {
                setError(fileError)
                setLoading(false)
                return
            }
            if (!fileData) {
                setError(new Error("could not download file contents"))
                setLoading(false)
                return
            }

            const { content } = await getHtmlFromMarkdown(fileData);
            setPrivatePost({ ...post, content, markdown: await fileData.text() })


            setLoading(false)
        }

        if (fetch.current && !isNaN(postId)) {
            fetchPost()
        }

        return () => {
            fetch.current = false
        }
    }, [postId])

    return {
        data: privatePost,
        error,
        loading
    }
}