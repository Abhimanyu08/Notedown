import { useSupabase } from "@/app/appContext";
import { BlogContext } from "@/app/apppost/components/BlogState";
import Post from "@/interfaces/Post";
import { SUPABASE_FILES_BUCKET, SUPABASE_IMAGE_BUCKET, SUPABASE_POST_TABLE } from "@utils/constants";
import { tryNTimesSupabaseStorageFunction, tryNTimesSupabaseTableFunction } from "@utils/multipleTries";
import { supabase } from "@utils/supabaseClient";
import { useContext, useEffect, useState } from "react";
import { EditorContext } from "../components/EditorContext";

function useUploadPost({ startUpload = false, setStartUpload }: { startUpload: boolean, setStartUpload: React.Dispatch<React.SetStateAction<boolean>> }) {

    const [uploading, setUploading] = useState(false)
    const [uploadStatus, setUploadStatus] = useState("")
    const [newPostId, setNewPostId] = useState<number>()
    const { editorState } = useContext(EditorContext)
    const { blogState } = useContext(BlogContext)

    const { session } = useSupabase()
    const created_by = session?.user?.id

    useEffect(() => {

        if (created_by && startUpload) {
            try {

                upload()
            } catch (e) {
                setStartUpload(false)
            }
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
        console.log(created_by)
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


    const uploadPostImages = async ({ postId }: { postId: number }) => {

        const imagesToUpload = Array.from(new Set(blogState.imagesToUpload))

        for (const image of imagesToUpload) {

            setUploadStatus(`Uploading ${image}`)
            const folderName = created_by + "/" + postId + "/" + image
            const imageFile = blogState.imagesToFiles[image]
            await tryNTimesSupabaseStorageFunction(() => supabase.storage.from(SUPABASE_IMAGE_BUCKET).upload(folderName, imageFile), 3)
        }


    }

    const uploadCanvasImages = async ({ postId }: { postId: number }) => {
        const canvasApps = blogState.canvasApps


        for (const [canvasImageName, canvasApp] of Object.entries(canvasApps)) {

            if (canvasApp === null) return;
            setUploadStatus(`Uploading ${canvasImageName}`)
            const newCanvasImage = await canvasApp.getImage("png");
            const folderName = created_by + "/" + postId + "/" + canvasImageName + ".png"
            await tryNTimesSupabaseStorageFunction(() => supabase.storage.from(SUPABASE_IMAGE_BUCKET).upload(folderName, newCanvasImage), 3)
        }
    }

    const finalUpdateToPost = async ({ postId, postMeta }: { postId: number, postMeta: ReturnType<typeof prepareForUpload> }) => {
        const folderName = created_by + "/" + postId
        const fileName = created_by + "/" + postId + "/" + postMeta.markdownFile.name
        tryNTimesSupabaseTableFunction<Post>(() =>
            supabase.from(SUPABASE_POST_TABLE).update({
                image_folder: folderName,
                filename: fileName
            }).eq("id", postId).select("*"), 3)

    }


    const upload = async () => {
        try {

            setUploading(true)


            setUploadStatus("preparing for upload")
            const postMeta = prepareForUpload()

            setUploadStatus("Uploading markdown file")
            const post = await uploadPostFile(postMeta)

            setUploadStatus("Uploading Images")
            await uploadPostImages({ postId: post.id })

            setUploadStatus("Uploading Canvas images")
            await uploadCanvasImages({ postId: post.id })

            await finalUpdateToPost({ postId: post.id, postMeta })
            setUploadStatus("Finished Uploading")
            setNewPostId(post.id)
            setUploading(false)
        } catch (e) {

            alert((e as Error).message)
            setUploading(false)
            setStartUpload(false)
        }

    }

    return { uploading, uploadStatus, newPostId }

}

export default useUploadPost