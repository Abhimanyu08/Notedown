import { EditorContext } from "@/app/write/components/EditorContext";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import { IndexedDbContext } from "@/contexts/IndexedDbContext";
import { useContext, useEffect, useState } from "react";

export default function useRecoverImages({ imageNames }: { imageNames: string[] }) {

    const { editorState, dispatch: editorStateDispatch } = useContext(EditorContext)
    const { blogState } = useContext(BlogContext)
    const { documentDb } = useContext(IndexedDbContext)
    const [urls, setUrls] = useState<string[]>([])


    useEffect(() => {

        for (let name of imageNames) {
            if (
                Object.hasOwn(editorState.imagesToFiles, name) ||
                Object.hasOwn(blogState.uploadedImages, name)
            ) {
                const src = editorState.imagesToFiles[name]
                    ? window.URL.createObjectURL(
                        editorState.imagesToFiles[name]
                    )
                    : blogState.uploadedImages[name]
                setUrls(p => [...p, src])

                continue
            }

            if (!documentDb) continue;
            const imageObjectStore = documentDb
                .transaction("images", "readonly")
                .objectStore("images")


            const request = imageObjectStore.get(name);

            request.onsuccess = (e) => {
                const { imageBlob } = (
                    e.target as IDBRequest<{ imageName: string; imageBlob: File }>
                ).result;
                const src = window.URL.createObjectURL(imageBlob);
                setUrls(p => [...p, src])
                editorStateDispatch({ type: "add image to files", payload: { [name]: imageBlob } })

            };
        }
    }, [documentDb]);


    return urls
}