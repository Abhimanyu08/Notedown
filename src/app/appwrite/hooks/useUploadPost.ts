import Post from "@/interfaces/Post";
import { SUPABASE_POST_TABLE, SUPABASE_FILES_BUCKET, SUPABASE_IMAGE_BUCKET } from "@utils/constants";
import { makeFolderName } from "@utils/makeFolderName";
import { tryNTimesSupabaseStorageFunction, tryNTimesSupabaseTableFunction } from "@utils/multipleTries";
import { supabase } from "@utils/supabaseClient";
import { useContext, useEffect, useState } from "react";
import { EditorContext } from "../components/EditorContext";
import { BlogContext } from "@/app/apppost/components/BlogState";
import { language } from "gray-matter";
import { UserContext } from "@/app/appContext";

function useUploadPost({ startUpload = false }: { startUpload: boolean }) {

    const [uploadStage, setUploadStage] = useState<"file" | "photos" | "canvas">("file")
    const { editorState } = useContext(EditorContext)
    const { blogState } = useContext(BlogContext)
    const { user } = useContext(UserContext);
    const created_by = user?.id

    useEffect(() => {

        if (startUpload) {
            const postMeta = prepareForUpload()
            uploadPostFile(postMeta).then((post) => {
                uploadPostImages({ postId: `${post.id}` })
                uploadCanvasImages({ postId: `${post.id}` })
            })
        }
    }, [startUpload])


    const prepareForUpload = () => {
        const markdown = editorState.editorView?.state.doc.toJSON().join("\n")
        if (!markdown) throw new Error("Couldn't read markdown")
        const markdownFile = new File([markdown], "file.md")

        return {
            title: blogState.blogMeta.title || "",
            description: blogState.blogMeta.description || "",
            language: blogState.blogMeta.language || "",
            markdownFile
        }
    }


    const uploadPostFile = async ({ title, description, language, markdownFile }: { title: string, description: string, language: string, markdownFile: File }) => {
        const [newPost] = await tryNTimesSupabaseTableFunction<Post>(() => supabase.from(SUPABASE_POST_TABLE).insert({
            title,
            description,
            language,
            created_by
        }).select("*"), 3);

        //upload markdown file
        const folderName = created_by + "/" + newPost.id + "/" + markdownFile.name
        await tryNTimesSupabaseStorageFunction(() => supabase.storage.from(SUPABASE_FILES_BUCKET).upload(folderName, markdownFile), 3)

        return newPost
    }


    const uploadPostImages = async ({ postId }: { postId: string }) => {
        const imagesToUpload = blogState.imagesToUpload
        await Promise.all(
            imagesToUpload.map((image) => {

                const folderName = created_by + "/" + postId + "/" + image
                const imageFile = blogState.imagesToFiles[image]
                tryNTimesSupabaseStorageFunction(() => supabase.storage.from(SUPABASE_IMAGE_BUCKET).upload(folderName, imageFile), 3)
            })
        ).catch((reason) => { throw new Error(reason) })

    }

    const uploadCanvasImages = async ({ postId }: { postId: string }) => {
        const canvasApps = blogState.canvasApps



        const results = await Promise.allSettled(Object.entries(canvasApps).map(async ([canvasImageName, canvasApp]) => {
            if (canvasApp === null) return;
            const newCanvasImage = await canvasApp.getImage("png");
            const folderName = created_by + "/" + postId + "/" + canvasImageName + ".png"
            tryNTimesSupabaseStorageFunction(() => supabase.storage.from(SUPABASE_IMAGE_BUCKET).upload(folderName, newCanvasImage), 3)

        }))


        console.log(results)
        // we need to delete the previous canvas images because user has redrawn them.
    }

}

export default useUploadPost