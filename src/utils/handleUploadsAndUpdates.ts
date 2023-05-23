import Post from "../src/interfaces/Post"
import { ALLOWED_LANGUAGES, SUPABASE_FILES_BUCKET, SUPABASE_IMAGE_BUCKET, SUPABASE_POST_TABLE } from "./constants"
import { makeFolderName, processImageName } from "./makeFolderName"
import { tryNTimesSupabaseStorageFunction, tryNTimesSupabaseTableFunction } from "./multipleTries"
import { supabase } from "./supabaseClient"

interface handleUploadProps {
    userId: string,
    postMetadata: { title: string, description: string, language?: typeof ALLOWED_LANGUAGES[number] }
    markdownFile: File,
    imagesToUpload: File[]
}

interface handleUpdateProps extends handleUploadProps {
    postId: number,
    imagesToDelete: string[],
}


export async function handlePostUpload({ userId, postMetadata, markdownFile, imagesToUpload }: handleUploadProps): Promise<Post | undefined> {

    //1. make a new entry in the post table using postMetadata and get the id
    //2. upload the file, images and drawings to appropriate folder using id
    //3. if successful add the image_folder and file address to the table entry

    try {

        //make a entry in the table

        const [newPost] = await tryNTimesSupabaseTableFunction<Post>(() => supabase.from(SUPABASE_POST_TABLE).insert({
            title: postMetadata.title,
            description: postMetadata.description,
            language: postMetadata.language,
            created_by: userId
        }).select("*"), 3);

        //upload markdown file
        const folderName = makeFolderName(userId, newPost.id)
        const fileName = `${folderName}/${markdownFile.name}`
        await tryNTimesSupabaseStorageFunction(() => supabase.storage.from(SUPABASE_FILES_BUCKET).upload(fileName, markdownFile), 3)

        //upload images
        await Promise.all(
            imagesToUpload.map((image) => {

                tryNTimesSupabaseStorageFunction(() => supabase.storage.from(SUPABASE_IMAGE_BUCKET).upload(`${folderName}/${processImageName(image.name)}`, image), 3)
            })
        ).catch((reason) => { throw new Error(reason) })


        //update the image_folder and file_name in table row
        const [finalNewPost] = await tryNTimesSupabaseTableFunction<Post>(() =>
            supabase.from(SUPABASE_POST_TABLE).update({
                image_folder: folderName,
                filename: fileName
            }).eq("id", newPost.id).select("*"), 3)

        return finalNewPost

    } catch (e) {
        if (e instanceof Error) alert(e.message)
        else { alert("Some unkown error") }
    }

}


export async function handlePostUpdate({ userId, postId, postMetadata, markdownFile, imagesToUpload, imagesToDelete }: handleUpdateProps) {

    //1. If there's postMetadata we need to make changes to the corresponding post entry
    //2. if there are new images, upload them
    //3. if there's new file, replace the old with the new
    //4. Upload new images if any
    try {
        const folderName = `${userId}/${postId}`

        // ----------------Update the post---------------------
        const [updatedPost] = await tryNTimesSupabaseTableFunction<Post>(() => supabase.from<Post>(SUPABASE_POST_TABLE).update({
            title: postMetadata.title,
            description: postMetadata.description,
            language: postMetadata.language,
        }).eq("id", postId), 3)

        const fileName = updatedPost.filename

        //----------------------Update the markdown---------------  
        await tryNTimesSupabaseStorageFunction(() => supabase.storage.from(SUPABASE_FILES_BUCKET).update(
            fileName, markdownFile
        ), 3)


        // ------------------ Delete the images--------------------
        if (imagesToDelete.length > 0) {
            await tryNTimesSupabaseStorageFunction(() => supabase.storage
                .from(SUPABASE_IMAGE_BUCKET)
                .remove(
                    imagesToDelete.map(
                        (name) => `${folderName}/${name}`
                    )
                ), 3)
        }

        //upload new images

        Promise.all(
            imagesToUpload.map((image) => {

                tryNTimesSupabaseStorageFunction(() => supabase.storage.from(SUPABASE_IMAGE_BUCKET).upload(`${folderName}/${processImageName(image.name)}`, image), 3)
            })
        ).catch((reason) => { throw new Error(reason) })


        return updatedPost

    } catch (e) {
        if (e instanceof Error) alert(e.message)
        else { alert("Unknown error") }
    }


}
