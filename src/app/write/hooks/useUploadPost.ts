import { useSupabase } from "@/app/appContext";
import { ToastContext } from "@/contexts/ToastProvider";
import Post from "@/interfaces/Post";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import { IndexedDbContext } from "@components/Contexts/IndexedDbContext";
import { ALLOWED_LANGUAGES, SUPABASE_BLOGTAG_TABLE, SUPABASE_FILES_BUCKET, SUPABASE_IMAGE_BUCKET, SUPABASE_POST_TABLE, SUPABASE_TAGS_TABLE } from "@utils/constants";
import { getMarkdownObjectStore } from "@utils/indexDbFuncs";
import { tryNTimesSupabaseStorageFunction, tryNTimesSupabaseTableFunction } from "@utils/multipleTries";
import editorToJsonFile from "@utils/processingTldrawings";
import { sendRevalidationRequest } from "@utils/sendRequest";
import { useContext, useEffect, useState } from "react";
import { EditorContext } from "../components/EditorContext";
import { parseFrontMatter } from "@utils/getResources";
import { Database } from "@/interfaces/supabase";

function updateIndexDbMarkdown(db: IDBDatabase, key: string, postId: number) {
    const mdObjectStore = getMarkdownObjectStore(db)

    const mdReq = mdObjectStore.get(key)

    mdReq.onsuccess = () => {
        const previousData = mdReq.result
        previousData.postId = postId

        mdObjectStore.put(previousData)
    }
}

function useUploadPost({ startUpload = false }: { startUpload: boolean }) {

    const [uploadFinished, setUploadFinished] = useState(false)
    const { editorState, dispatch: editorStateDispatch } = useContext(EditorContext)
    const { blogState, dispatch } = useContext(BlogContext)
    const toastContext = useContext(ToastContext)
    const { documentDb } = useContext(IndexedDbContext)

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

                dispatch({
                    type: "set blog meta",
                    payload: { id: postId },
                });

                if (documentDb) {
                    updateIndexDbMarkdown(documentDb, editorState.timeStamp || "", postId)
                }
                sendRevalidationRequest('/profile/[id]')
                toastContext?.setMessage("Changes Uploaded");

            }).catch((e) => {
                alert((e as Error).message)
                setUploadFinished(true)
            })

        }

    }, [startUpload, documentDb])


    const prepareForUpload = () => {
        const markdown = editorState.editorView?.state.sliceDoc()
        if (!markdown) throw new Error("Couldn't read markdown")
        const markdownFile = new File([markdown], "file.md")
        let language = blogState.blogMeta.language
        if (!ALLOWED_LANGUAGES.includes(language as any)) {
            language = null
        }
        const { data } = parseFrontMatter(markdown)
        return {
            title: data.title || "",
            description: data.description || "",
            language: data.language || null,
            tags: data.tags,
            markdownFile
        }
    }



    const uploadPostRow = async ({ title, description, language }: { title: string, description: string, language: typeof ALLOWED_LANGUAGES[number] | null }) => {
        const [newPost] = await tryNTimesSupabaseTableFunction<Post>(() => supabase.from(SUPABASE_POST_TABLE).insert({
            title,
            description,
            language,
            created_by,
            timestamp: editorState.timeStamp
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

    const uploadTags = async ({ tags }: { tags: string[] }) => {
        const tagIds: number[] = []
        for (let tag of tags) {
            // we can't bulk insert tags cause we need to bypass the violation of tag_name,created_by unique constraint.

            const { data, error } = await supabase.from(SUPABASE_TAGS_TABLE).insert({ tag_name: tag, created_by }).select("*").single();
            if (data) tagIds.push(data.id)
            if (error) {
                // there's a violation of unique key constraint
                if (error.message === 'duplicate key value violates unique constraint "unique_tag_created_by"') {
                    const { data } = await supabase.from(SUPABASE_TAGS_TABLE).select("id").match({ tag_name: tag, created_by }).single()
                    if (data) tagIds.push(data.id)
                }
            }
        }
        return tagIds
    }



    const uploadBlogTag = async ({ postId, tagIds }: { postId: number, tagIds: number[] }) => {
        const tagBlogData = tagIds.map((tid) => ({ tag_id: tid, blog_id: postId }))

        for (let tagBlog of tagBlogData) {
            // can't bulk insert cause we may be violating unique key constraint on (blog_id, tag_id)
            await supabase.from(SUPABASE_BLOGTAG_TABLE).insert(tagBlog)
        }

    }

    const deleteBlogTags = async ({ postId, tagIds }: { postId: number, tagIds: number[] }) => {
        //we may have to delete some combination of tag and posts cause user may have deleted some tags from his post
        const { data } = await supabase.from(SUPABASE_BLOGTAG_TABLE).select("tag_id, blog_id").match({ blog_id: postId })
        if (data) {
            const rowsToDelete = data.filter((d) => !(tagIds.includes(d.tag_id!)))
            console.log(rowsToDelete)
            for (let { blog_id, tag_id } of rowsToDelete) {
                await supabase.from(SUPABASE_BLOGTAG_TABLE).delete().match({ blog_id, tag_id })
            }
        }

    }

    const uploadPostMarkdownFile = async ({ postId, markdownFile }: { postId: Number, markdownFile: File }) => {
        const folderName = created_by + "/" + postId + "/" + markdownFile.name
        await tryNTimesSupabaseStorageFunction(() => supabase.storage.from(SUPABASE_FILES_BUCKET).upload(folderName, markdownFile, { upsert: true }), 3)

    }

    const deleteRedundantImages = async ({ postId }: { postId: number }) => {

        const uploadedImages = Object.keys(blogState.uploadedImages)

        const imagesToDelete = uploadedImages.filter(i => !(editorState.imagesToUpload.includes(i))).map(i => created_by + '/' + postId + "/" + i)

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

        const tags = postMeta.tags
        if (tags) {
            const tagIds = await uploadTags({ tags })
            await uploadBlogTag({ postId: post.id, tagIds })
        }

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
        const tags = postMeta.tags

        if (tags) {
            const tagIds = await uploadTags({ tags })
            await deleteBlogTags({ postId, tagIds })
            await uploadBlogTag({ postId, tagIds })
        }
        else {
            await deleteBlogTags({ postId, tagIds: [] })
        }
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


