import { IndexedDbContext } from "@components/Contexts/IndexedDbContext";
import { getMarkdownObjectStore } from "@utils/indexDbFuncs";
import { processNoTagDrafts } from "@utils/processDrafts";
import { useContext, useState, useEffect } from "react";

export default function useRetrieveDrafts() {

    const [loadingDrafts, setLoadingDrafts] = useState(true);
    const { documentDb } = useContext(IndexedDbContext);
    const [tagToDraftMap, setTagToDraftMap] = useState(
        new Map<string, { timeStamp: string; markdown: string }[]>()
    );

    useEffect(() => {
        if (documentDb) {
            const mdObjectStore = getMarkdownObjectStore(
                documentDb,
                "readonly"
            );
            const tagsIndex = mdObjectStore.index("tagsIndex");

            const cursorRequest = tagsIndex.openCursor();
            cursorRequest.onsuccess = function (event) {
                const cursor = (event.target as IDBRequest<IDBCursorWithValue>)
                    .result;
                if (cursor) {
                    const tag = cursor.key;
                    setTagToDraftMap((p) => {
                        const previousDrafts = p.get(tag as string) || [];
                        previousDrafts?.push(cursor.value);
                        p.set(tag as string, previousDrafts);
                        return p;
                    });

                    cursor.continue();
                } else {
                    // setLoadingDrafts(false);
                }
            };

            processNoTagDrafts(documentDb).then((rawObjs) => {
                setTagToDraftMap((p) => {
                    p.set("notag", rawObjs);
                    setLoadingDrafts(false)
                    return p;
                });
            });
        }
    }, [documentDb]);
    return { tagToDraftMap, loadingDrafts }
}