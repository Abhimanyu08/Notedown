import { useSupabase } from "@/app/appContext";
import Post from "@/interfaces/Post";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import { ALLOWED_LANGUAGES, SUPABASE_FILES_BUCKET, SUPABASE_IMAGE_BUCKET, SUPABASE_POST_TABLE } from "@utils/constants";
import { tryNTimesSupabaseStorageFunction, tryNTimesSupabaseTableFunction } from "@utils/multipleTries";
import { ToastContext } from "@/contexts/ToastProvider";
import makeLocalStorageDraftKey from "@utils/makeLocalStorageKey";
import { useContext, useEffect, useState } from "react";
import { EditorContext } from "../components/EditorContext";
import editorToJsonFile from "@utils/processingTldrawings";
import { sendRevalidationRequest } from "@utils/sendRequest";

function useUploadPost({ startUpload = false }: { startUpload: boolean }) {

    const [uploadFinished, setUploadFinished] = useState(false)
    const { editorState, dispatch: editorStateDispatch } = useContext(EditorContext)
    const { blogState, dispatch } = useContext(BlogContext)
    const toastContext = useContext(ToastContext)
    const context = useContext(ToastContext);

    const { supabase, session } = useSupabase()
    const created_by = session?.user?.id

    useEffect(() => {


        if (created_by && startUpload) {
            setUploadFinished(false)
            let process = upload
            if (blogState.blogMeta.id) process = update

            process().then((postId) => {
                toastContext?.setMessage("Finished!")
                afterUpload()
                setUploadFinished(true)

                const localStorageKey = makeLocalStorageDraftKey(
                    editorState.timeStamp!,
                    blogState.blogMeta.id
                );
                localStorage.removeItem(localStorageKey);
                dispatch({
                    type: "set blog meta",
                    payload: { id: postId },
                });
                sendRevalidationRequest('/profile/[id]')
                context?.setMessage("Changes Uploaded");

            }).catch((e) => {
                alert((e as Error).message)
                setUploadFinished(true)
            })

        }

    }, [startUpload])


    const prepareForUpload = () => {
        const markdown = editorState.editorView?.state.sliceDoc()
        if (!markdown) throw new Error("Couldn't read markdown")
        const markdownFile = new File([markdown], "file.md")
        let language = blogState.blogMeta.language
        if (!ALLOWED_LANGUAGES.includes(language as any)) {
            language = null
        }
        return {
            title: blogState.blogMeta.title || "",
            description: blogState.blogMeta.description || "",
            language: language || null,
            markdownFile
        }
    }


    const uploadPostRow = async ({ title, description, language }: { title: string, description: string, language: typeof ALLOWED_LANGUAGES[number] | null }) => {
        const [newPost] = await tryNTimesSupabaseTableFunction<Post>(() => supabase.from(SUPABASE_POST_TABLE).insert({
            title,
            description,
            language,
            created_by
        }).select("*"), 3);


        return newPost
    }
    const updatePostRow = async ({ postId, title, description, language }: { postId: number, title: string, description: string, language: typeof ALLOWED_LANGUAGES[number] | null }) => {
        const [newPost] = await tryNTimesSupabaseTableFunction<Post>(() => supabase.from(SUPABASE_POST_TABLE).update({
            title,
            description,
            language,
        }).eq("id", postId).select("id,title,description,language,published"), 3);


        return newPost
    }

    const uploadPostMarkdownFile = async ({ postId, markdownFile }: { postId: Number, markdownFile: File }) => {
        const folderName = created_by + "/" + postId + "/" + markdownFile.name
        await tryNTimesSupabaseStorageFunction(() => supabase.storage.from(SUPABASE_FILES_BUCKET).upload(folderName, markdownFile, { upsert: true }), 3)

    }

    const deleteRedundantImages = async ({ postId }: { postId: number }) => {

        const uploadedImages = Object.keys(blogState.uploadedImages)

        const imagesToDelete = uploadedImages.filter(i => !(editorState.imagesToUpload.includes(i))).map(i => created_by + '/' + postId + "/" + i)

        console.log(imagesToDelete)
        await supabase.storage.from(SUPABASE_IMAGE_BUCKET).remove(imagesToDelete)

    }

    const uploadPostImages = async ({ postId }: { postId: number }) => {

        const imagesToUpload = Array.from(new Set(editorState.imagesToUpload)).filter(i => !(Object.hasOwn(blogState.uploadedImages, i)))

        for (const image of imagesToUpload) {

            toastContext?.setMessage(`Uploading ${image}`)
            const folderName = created_by + "/" + postId + "/" + image
            const imageFile = editorState.imagesToFiles[image]
            await tryNTimesSupabaseStorageFunction(() => supabase.storage.from(SUPABASE_IMAGE_BUCKET).upload(folderName, imageFile), 3)
        }


    }

    const uploadSandboxes = async ({ postId }: { postId: number }) => {
        const sandboxEditors = editorState.sandboxEditors


        for (const [sandboxKey, sandboxEditor] of Object.entries(sandboxEditors)) {

            if (sandboxEditor === null) return;
            toastContext?.setMessage(`Uploading sandbox-${sandboxKey}`)
            const jsonString = sandboxEditor.state.sliceDoc().trim()
            const fileObject = new File([jsonString], `${sandboxKey}.json`, { type: "application/json" })
            if (!fileObject) continue
            const folderName = created_by + "/" + postId + "/" + sandboxKey + ".json"
            await tryNTimesSupabaseStorageFunction(() => supabase.storage.from(SUPABASE_FILES_BUCKET).upload(folderName, fileObject, { upsert: true }), 3)
        }
    }

    const uploadCanvasImages = async ({ postId }: { postId: number }) => {
        const canvasApps = editorState.canvasApps as Record<string, any>


        for (const [canvasImageName, canvasApp] of Object.entries(canvasApps)) {

            if (canvasApp === null) return;
            toastContext?.setMessage(`Uploading ${canvasImageName}`)
            const fileObject = await editorToJsonFile(canvasApp, canvasImageName)
            if (!fileObject) continue
            const folderName = created_by + "/" + postId + "/" + canvasImageName + ".json"
            await tryNTimesSupabaseStorageFunction(() => supabase.storage.from(SUPABASE_FILES_BUCKET).upload(folderName, fileObject, { upsert: true }), 3)
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



        toastContext?.setMessage("preparing for upload")
        const postMeta = prepareForUpload()

        toastContext?.setMessage("Uploading markdown file")
        const post = await uploadPostRow(postMeta)
        await uploadPostMarkdownFile({ postId: post.id, markdownFile: postMeta.markdownFile })

        toastContext?.setMessage("Uploading Images")
        await uploadPostImages({ postId: post.id })

        toastContext?.setMessage("Uploading Canvas images")
        await uploadCanvasImages({ postId: post.id })
        await uploadSandboxes({ postId: post.id })

        await finalUpdateToPost({ postId: post.id, postMeta })

        return post.id


    }
    const update = async () => {
        const postId = blogState.blogMeta.id!
        toastContext?.setMessage("preparing for update")
        const postMeta = prepareForUpload()

        toastContext?.setMessage("updating post row")
        //update the post row in the table to have new title,description,language etc.
        await updatePostRow({ postId, ...postMeta })
        // upload new markdown file for the blog post
        toastContext?.setMessage("updating markdown file")
        await uploadPostMarkdownFile({ postId, markdownFile: postMeta.markdownFile })

        //delete the images that need to be deleted
        toastContext?.setMessage("deleting redundant images")
        await deleteRedundantImages({ postId })

        //upload image files that need to be uploaded
        toastContext?.setMessage("Uploading new images")
        await uploadPostImages({ postId })

        //upload canvas files that need to be uploaded
        toastContext?.setMessage("Updating and uploading new canvas images")
        await uploadCanvasImages({ postId })
        await uploadSandboxes({ postId: postId })

        toastContext?.setMessage("Finished updating!")
        // if (published) {
        //     revalidatePath("/profile/[id]/posts/(...)post/[postId]");
        // }
        //done
        return postId
    }

    const afterUpload = () => {
        const addedUploads: Record<string, string> = {}
        for (let imageName of editorState.imagesToUpload) {
            if (!Object.hasOwn(blogState.uploadedImages, imageName)) {
                if (/^canvas-(\d+)\.png/.test(imageName)) {
                    addedUploads[imageName] = ""
                    continue
                }
                addedUploads[imageName] = URL.createObjectURL(editorState.imagesToFiles[imageName])
            }
            else {
                addedUploads[imageName] = blogState.uploadedImages[imageName]
            }
        }
        dispatch({ type: "set uploaded images", payload: addedUploads })

        editorStateDispatch({ type: "empty canvas apps", payload: null })

    }

    return { uploadFinished }

}

export default useUploadPost


