import { IndexedDbContext } from "@components/Contexts/IndexedDbContext";
import { getMarkdownObjectStore } from "@utils/indexDbFuncs";
import { RawObject, processNoTagDrafts } from "@utils/processDrafts";
import { useContext, useState, useEffect, Dispatch, SetStateAction } from "react";

export default function useRetrieveDrafts({ loadDrafts, setLoadDrafts }: { loadDrafts: boolean, setLoadDrafts: Dispatch<SetStateAction<boolean>> }) {

    const { documentDb } = useContext(IndexedDbContext);
    const [tagToDraftMap, setTagToDraftMap] = useState(
        new Map<string, RawObject[]>()
    );

    useEffect(() => {
        if (documentDb && loadDrafts) {
            setTagToDraftMap(new Map())
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
                    setLoadDrafts(false)
                    return p;
                });
            });
        }
    }, [documentDb, loadDrafts]);
    return { tagToDraftMap }
}