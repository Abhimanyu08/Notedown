import { useSupabase } from "@/app/appContext";
import { Database } from "@/interfaces/supabase";
import { IndexedDbContext } from "@/contexts/IndexedDbContext";
import { PostgrestError } from "@supabase/supabase-js";
import { SEARCH_PRIVATE, SEARCH_PUBLC } from "@utils/constants";
import { getMarkdownObjectStore } from "@utils/indexDbFuncs";
import { Draft, RawObject, rawObjectToDraft } from "@utils/processDrafts";
import { useContext, useEffect, useState } from "react";
import useOwner from "./useOwner";
import { useParams } from "next/navigation";

export default function useSearch(query: string) {

    const { supabase, session } = useSupabase()
    const [searching, setSearching] = useState(false)
    const [searchResults, setSearchResults] = useState<Database["public"]["Functions"]["search"]["Returns"]>([])
    const [draftSearchResults, setDraftSearchResults] = useState<Draft[]>([])
    const [searchError, setSearchError] = useState<Error | PostgrestError | null>(null)
    const { documentDb } = useContext(IndexedDbContext)
    const owner = useOwner()
    const params = useParams()


    useEffect(() => {

        if (!query) {
            setSearchResults([])
            setDraftSearchResults([])
            setSearchError(null)
            return
        }

        let searchQuery = query.trim().split(" ").join(" | ")
        setSearchError(null)
        setSearchResults([])
        setDraftSearchResults([])
        setSearching(true)

        if (owner && documentDb) {
            const results: RawObject[] = []
            const mdObjectStore = getMarkdownObjectStore(documentDb)
            const markdownIndex = mdObjectStore.index("markdownIndex")

            markdownIndex.openCursor().onsuccess = (e) => {
                const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result

                if (cursor) {
                    const record = (cursor.value as RawObject);
                    const regexpQuery = new RegExp(searchQuery, "i")
                    const searchRes = record.markdown.search(regexpQuery)
                    if (searchRes > -1) {
                        results.push(record)
                    }
                    cursor.continue();
                } else {
                    setDraftSearchResults(results.map(r => rawObjectToDraft(r)))
                }
            }
        }

        try {

            const searchFunction = "search"
            const searchParams = {
                user_id: params!.id as string,
                search_term: searchQuery,
            }

            supabase.rpc(searchFunction, searchParams).then((val) => {
                const { data, error } = val
                if (error) setSearchError(error)
                if (data === null || data.length === 0) return
                if (data) setSearchResults(data)
            })
        } catch (e) {
            setSearchError(e as Error)
        } finally {

            setSearching(false)
        }




    }, [query])


    return {
        searching,
        searchResults,
        searchError,
        draftSearchResults
    }


}