import { IndexedDbContext } from "@/contexts/IndexedDbContext";
import { ALLOWED_LANGUAGES } from "@utils/constants";
import { parseFrontMatter } from "@utils/getResources";
import { getMarkdownObjectStore } from "@utils/indexDbFuncs";
import { useContext, useEffect, useState } from "react";

export default function useRetrieveDraftFromIndexDb({ timeStamp }: { timeStamp: string }) {
    const [blogData, setBlogData] = useState<{ content: string, frontMatterLength: number, data: { title?: string, description?: string, postId?: number, language?: typeof ALLOWED_LANGUAGES[number] | null } }>({ content: "", frontMatterLength: 0, data: {} });
    const { documentDb } = useContext(IndexedDbContext);
    // const [validKey, setValidKey] = useState("");

    // useEffect(() => {
    //     if (!documentDb) return;

    //     const key = `draft-${timeStamp}`;

    //     const markdownObjectStoreRequest =
    //         getMarkdownObjectStore(documentDb).getKey(key);

    //     markdownObjectStoreRequest.onsuccess = (e) => {
    //         const result = (e.target as IDBRequest<IDBValidKey>).result;
    //         const validKey = result ? key : (timeStamp as string);
    //         setValidKey(validKey);
    //     };
    //     markdownObjectStoreRequest.onerror = (e) => {
    //         console.log("No key available of this name");
    //     };
    // }, [documentDb]);

    useEffect(() => {
        if (!documentDb) return;
        const markdownObjectStoreRequest =
            getMarkdownObjectStore(documentDb).get(timeStamp);

        markdownObjectStoreRequest.onsuccess = (e) => {
            const { markdown, postId } = (e.target as IDBRequest<{ markdown: string, postId?: number }>)
                .result;
            const { data, content } = parseFrontMatter(markdown)
            setBlogData(p => ({ ...p, content, data: { ...data, postId: postId } }));
        };
    }, [timeStamp, documentDb]);

    return blogData
}