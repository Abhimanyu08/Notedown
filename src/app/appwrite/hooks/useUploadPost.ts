import { useSupabase } from "@/app/AppContext";
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

                if (blogState.blogMeta.id) {
                    //id is already here which means user is updating his post
                    update()
                    return
                }
                upload()
            } catch (e) {
                setStartUpload(false)
            }
        }

    }, [startUpload])


    const prepareForUpload = () => {
        const markdown = editorState.editorView?.state.sliceDoc()
        if (!markdown) throw new Error("Couldn't read markdown")
        const markdownFile = new File([markdown], "file.md")

        return {
            title: blogState.blogMeta.title || "",
            description: blogState.blogMeta.description || "",
            language: blogState.blogMeta.language || "",
            markdownFile
        }
    }


    const uploadPostRow = async ({ title, description, language }: { title: string, description: string, language: string }) => {
        const [newPost] = await tryNTimesSupabaseTableFunction<Post>(() => supabase.from(SUPABASE_POST_TABLE).insert({
            title,
            description,
            language,
            created_by
        }).select("*"), 3);


        return newPost
    }
    const updatePostRow = async ({ postId, title, description, language }: { postId: number, title: string, description: string, language: string }) => {
        const [newPost] = await tryNTimesSupabaseTableFunction<Post>(() => supabase.from(SUPABASE_POST_TABLE).update({
            title,
            description,
            language,
        }).eq("id", postId).select("id,title,description,language"), 3);


        return newPost
    }

    const uploadPostMarkdownFile = async ({ postId, markdownFile }: { postId: Number, markdownFile: File }) => {
        const folderName = created_by + "/" + postId + "/" + markdownFile.name
        await tryNTimesSupabaseStorageFunction(() => supabase.storage.from(SUPABASE_FILES_BUCKET).upload(folderName, markdownFile, { upsert: true }), 3)

    }

    const deleteRedundantImages = async ({ postId }: { postId: number }) => {

        const uploadedImages = Object.keys(blogState.uploadedImages)
        const imagesToDelete = uploadedImages.filter(i => !(blogState.imagesToUpload.includes(i))).map(i => created_by + '/' + postId + "/" + i)

        console.log(imagesToDelete)
        await supabase.storage.from(SUPABASE_IMAGE_BUCKET).remove(imagesToDelete)

    }

    const uploadPostImages = async ({ postId }: { postId: number }) => {

        const imagesToUpload = Array.from(new Set(blogState.imagesToUpload)).filter(i => !(Object.hasOwn(blogState.uploadedImages, i)))

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
            await tryNTimesSupabaseStorageFunction(() => supabase.storage.from(SUPABASE_IMAGE_BUCKET).upload(folderName, newCanvasImage, { upsert: true }), 3)
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
            const post = await uploadPostRow(postMeta)
            await uploadPostMarkdownFile({ postId: post.id, markdownFile: postMeta.markdownFile })

            setUploadStatus("Uploading Images")
            await uploadPostImages({ postId: post.id })

            setUploadStatus("Uploading Canvas images")
            await uploadCanvasImages({ postId: post.id })

            await finalUpdateToPost({ postId: post.id, postMeta })
            setUploadStatus("Finished Uploading !")
            setNewPostId(post.id)
            setUploading(false)
        } catch (e) {

            alert((e as Error).message)
            setUploading(false)
            setStartUpload(false)
        }

    }
    const update = async () => {
        if (!blogState.blogMeta.id) return
        try {
            const postId = blogState.blogMeta.id
            setUploading(true)
            setUploadStatus("preparing for update")
            const postMeta = prepareForUpload()

            setUploadStatus("updating post row")
            //update the post row in the table to have new title,description,language etc.
            await updatePostRow({ postId, ...postMeta })
            // upload new markdown file for the blog post
            setUploadStatus("updating markdown file")
            await uploadPostMarkdownFile({ postId, markdownFile: postMeta.markdownFile })

            //delete the images that need to be deleted
            setUploadStatus("deleting redundant images")
            await deleteRedundantImages({ postId })

            //upload image files that need to be uploaded
            setUploadStatus("Uploading new images")
            await uploadPostImages({ postId })

            //upload canvas files that need to be uploaded
            setUploadStatus("Updating and uploading new canvas images")
            await uploadCanvasImages({ postId })

            setUploadStatus("Finished updating!")
            setUploading(false)
            setStartUpload(false)
            setNewPostId(blogState.blogMeta.id)
            //done
        } catch (e) {
            alert((e as Error).message)
            setUploading(false)
            setStartUpload(false)
        }
    }

    return { uploading, uploadStatus, newPostId }

}

export default useUploadPost