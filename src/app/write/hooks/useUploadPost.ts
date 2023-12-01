import { useSupabase } from "@/app/appContext";
import Post from "@/interfaces/Post";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import { IndexedDbContext } from "@/contexts/IndexedDbContext";
import { ALLOWED_LANGUAGES, SUPABASE_BLOGTAG_TABLE, SUPABASE_FILES_BUCKET, SUPABASE_IMAGE_BUCKET, SUPABASE_POST_TABLE, SUPABASE_SLUGPOST_TABLE, SUPABASE_TAGS_TABLE } from "@utils/constants";
import { getMarkdownObjectStore } from "@utils/indexDbFuncs";
import { tryNTimesSupabaseStorageFunction, tryNTimesSupabaseTableFunction } from "@utils/multipleTries";
import editorToJsonFile from "@utils/processingTldrawings";
import { sendRevalidationRequest } from "@utils/sendRequest";
import { useCallback, useContext, useEffect, useState } from "react";
import { EditorContext } from "../components/EditorContext";
import { parseFrontMatter } from "@utils/parseFrontMatter";
import { useToast } from "@components/ui/use-toast";

function updateIndexDbMarkdown(db: IDBDatabase, key: string, postId: number) {
    const mdObjectStore = getMarkdownObjectStore(db)

    const mdReq = mdObjectStore.get(key)

    mdReq.onsuccess = () => {
        const previousData = mdReq.result
        if (!previousData) return
        previousData.postId = postId

        mdObjectStore.put(previousData)
    }
}

function useUploadPost({ startUpload = false }: { startUpload: boolean }) {

    const [uploadFinished, setUploadFinished] = useState(false)
    const [uploadError, setUploadError] = useState<Error | null>(null)
    const { editorState, dispatch: editorStateDispatch } = useContext(EditorContext)
    const { blogState, dispatch } = useContext(BlogContext)
    const { documentDb } = useContext(IndexedDbContext)
    const [progressMessage, setProgressMessage] = useState("")
    const { toast } = useToast()

    const { supabase, session } = useSupabase()
    const created_by = session?.user?.id

    useEffect(() => {


        if (created_by && startUpload) {
            setUploadFinished(false)
            let process = upload
            if (blogState.blogMeta.id) process = update

            process().then((post) => {
                setProgressMessage("Finished!")
                afterUpload()
                setUploadFinished(true)

                dispatch({
                    type: "set blog meta",
                    payload: { id: post.id, slug: post.slug || undefined },
                });

                if (documentDb) {
                    updateIndexDbMarkdown(documentDb, editorState.timeStamp || "", post.id)
                }
                sendRevalidationRequest(`/notebook/${created_by}`)
                const revalidationPath = "/note" + (blogState.blogMeta.published ? "" : "/private") + "/" + (blogState.blogMeta.slug ?? post.id)
                sendRevalidationRequest(revalidationPath)
                setProgressMessage("Changes Uploaded");

            }).catch((e) => {
                toast({
                    title: (e as Error).message,
                    duration: 2000,
                    variant: "destructive"
                }
                )
                setUploadError(e)
                setUploadFinished(true)
            })

        }

    }, [startUpload, documentDb])

    const prepareForUpload = () => {
        const markdown = editorState.editorView?.state.sliceDoc()
        if (!markdown) throw new Error("Couldn't read markdown")
        const markdownFile = new File([markdown], "file.md")

        const { data } = parseFrontMatter(markdown)
        if (!isNaN(parseInt(data.slug || ""))) {
            throw new Error("Posts's slug can't be an integer")
        }
        return {
            title: data.title || "",
            description: data.description || "",
            language: data.language || null,
            tags: data.tags,
            slug: data.slug,
            markdownFile
        }
    }

    const uploadPostRow = async ({ title, description, language, slug }: { title: string, description: string, language: typeof ALLOWED_LANGUAGES[number] | null, slug?: string }) => {
        const { data: newPost, error } = await supabase.from(SUPABASE_POST_TABLE).insert({
            title,
            description,
            language,
            created_by,
            slug: slug || null,
            timestamp: editorState.timeStamp
        }).select("id,slug").single()

        if (error) {
            console.error(error)

            if (error.message === `duplicate key value violates unique constraint "posts_slug_key"`) {
                throw new Error("Please choose a unique slug")
            }
            throw new Error(error.message)
        }

        return newPost
    }

    const updatePostRow = async ({ postId, title, description, language, slug }: { postId: number, title: string, description: string, language: typeof ALLOWED_LANGUAGES[number] | null, slug?: string }) => {
        const { data: newPost, error } = await supabase.from(SUPABASE_POST_TABLE).update({
            title,
            description,
            language,
            slug: slug || null
        }).eq("id", postId).select("id,slug").single();

        if (error) {
            console.error(error)
            throw new Error(error.message)
        }

        return newPost
    }

    const uploadSlugPostRow = async ({ postId, slug }: { postId: number, slug?: string }) => {
        const previousActiveSlug = blogState.blogMeta.slug
        console.log("Previous active slug", previousActiveSlug)

        if (previousActiveSlug && slug !== previousActiveSlug) {
            const { } = await supabase.from(SUPABASE_SLUGPOST_TABLE).update({ active: false }).eq("slug", previousActiveSlug).select("id")
        }

        if (!slug) return

        const { error } = await supabase.from(SUPABASE_SLUGPOST_TABLE).insert({
            postid: postId,
            slug,
            active: true
        }).select("id")
        if (error) {
            // threw error because the user is updating a previous slug  

            const { } = await supabase.from(SUPABASE_SLUGPOST_TABLE).update({
                active: true
            }).eq("slug", slug)
        }
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

            setProgressMessage(`Uploading ${image}`)
            const folderName = created_by + "/" + postId + "/" + image
            const imageFile = editorState.imagesToFiles[image]
            await tryNTimesSupabaseStorageFunction(() => supabase.storage.from(SUPABASE_IMAGE_BUCKET).upload(folderName, imageFile), 3)
        }


    }

    const uploadSandboxes = async ({ postId }: { postId: number }) => {
        const sandboxEditors = editorState.sandboxEditors


        for (const [sandboxKey, sandboxEditor] of Object.entries(sandboxEditors)) {

            if (sandboxEditor === null) return;
            setProgressMessage(`Uploading sandbox-${sandboxKey}`)
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
            setProgressMessage(`Uploading ${canvasImageName}`)
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

        setProgressMessage("Preparing for upload")
        const postMeta = prepareForUpload()
        const post = await uploadPostRow(postMeta)


        if (postMeta.slug) {

            await uploadSlugPostRow({ postId: post.id, slug: postMeta.slug })
        }

        setProgressMessage("Uploading markdown file")
        await uploadPostMarkdownFile({ postId: post.id, markdownFile: postMeta.markdownFile })

        const tags = postMeta.tags
        if (tags) {
            const tagIds = await uploadTags({ tags })
            await uploadBlogTag({ postId: post.id, tagIds })
        }

        setProgressMessage("Uploading Images")
        await uploadPostImages({ postId: post.id })

        setProgressMessage("Uploading Canvas images")
        await uploadCanvasImages({ postId: post.id })
        await uploadSandboxes({ postId: post.id })

        await finalUpdateToPost({ postId: post.id, postMeta })

        return post
    }

    const update = async () => {
        const postId = blogState.blogMeta.id!
        setProgressMessage("Preparing for update")
        const postMeta = prepareForUpload()



        setProgressMessage("Updating post row")
        //update the post row in the table to have new title,description,language etc.
        const post = await updatePostRow({ postId, ...postMeta })
        await uploadSlugPostRow({ postId, slug: postMeta.slug })
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
        setProgressMessage("Updating markdown file")
        await uploadPostMarkdownFile({ postId, markdownFile: postMeta.markdownFile })

        //delete the images that need to be deleted
        setProgressMessage("Deleting redundant images")
        await deleteRedundantImages({ postId })

        //upload image files that need to be uploaded
        setProgressMessage("Uploading new images")
        await uploadPostImages({ postId })

        //upload canvas files that need to be uploaded
        setProgressMessage("Updating and uploading new canvas images")
        await uploadCanvasImages({ postId })
        await uploadSandboxes({ postId: postId })

        setProgressMessage("Finished updating!")
        return post
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

    return { uploadFinished, uploadError, progressMessage }

}

export default useUploadPost


