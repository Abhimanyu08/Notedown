import { IndexedDbContext } from "@components/Contexts/IndexedDbContext";
import { parseFrontMatter } from "@utils/getResources";
import { getMarkdownObjectStore } from "@utils/indexDbFuncs";
import { useContext, useEffect, useState } from "react";

export default function useRetrieveDraftFromIndexDb({ timeStamp }: { timeStamp: string }) {
    const [blogData, setBlogData] = useState<
        ReturnType<typeof parseFrontMatter>
    >({ content: "", frontMatterLength: 0, data: {} });
    const { documentDb } = useContext(IndexedDbContext);
    const [validKey, setValidKey] = useState("");

    useEffect(() => {
        if (!documentDb) return;

        const key = `draft-${timeStamp}`;

        const markdownObjectStoreRequest =
            getMarkdownObjectStore(documentDb).getKey(key);

        markdownObjectStoreRequest.onsuccess = (e) => {
            console.log("here");
            const result = (e.target as IDBRequest<IDBValidKey>).result;
            console.log(result);
            const validKey = result ? key : (timeStamp as string);
            setValidKey(validKey);
        };
        markdownObjectStoreRequest.onerror = (e) => {
            console.log("No key available of this name");
        };
    }, [documentDb]);

    useEffect(() => {
        if (!validKey || !documentDb) return;
        const markdownObjectStoreRequest =
            getMarkdownObjectStore(documentDb).get(validKey);

        markdownObjectStoreRequest.onsuccess = (e) => {
            const { markdown } = (e.target as IDBRequest<{ markdown: string }>)
                .result;
            const { data, content } = parseFrontMatter(markdown)
            setBlogData(p => ({ ...p, content, data }));
        };
    }, [validKey]);

    return blogData
}