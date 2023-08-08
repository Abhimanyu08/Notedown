import { useSupabase } from "@/app/appContext";
import { Database } from "@/interfaces/supabase";
import { IndexedDbContext } from "@components/Contexts/IndexedDbContext";
import { PostgrestError } from "@supabase/supabase-js";
import { SEARCH_PRIVATE, SEARCH_PUBLC } from "@utils/constants";
import { getMarkdownObjectStore } from "@utils/indexDbFuncs";
import { RawObject } from "@utils/processDrafts";
import { usePathname } from "next/navigation";
import { useContext, useEffect, useState } from "react";

export default function useSearch(query: string) {

    const { supabase, session } = useSupabase()
    const [searching, setSearching] = useState(false)
    const [searchResults, setSearchResults] = useState<Database["public"]["Functions"]["private_search"]["Returns"]>([])
    const [draftSearchResults, setDraftSearchResults] = useState<RawObject[]>([])
    const [searchError, setSearchError] = useState<Error | PostgrestError | null>(null)
    const [owner, setOwner] = useState(false)
    const { documentDb } = useContext(IndexedDbContext)
    const pathname = usePathname()

    useEffect(() => {

        setOwner(!!(session?.user.id !== undefined && pathname?.split("/").at(2) === session.user.id))

    }, [session?.user.id])

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
                    if (record.markdown.search(regexpQuery)) {
                        results.push(record)
                    }
                    cursor.continue();
                } else {
                    setDraftSearchResults(results)
                }
            }
        }

        try {

            const searchFunction = owner ? SEARCH_PRIVATE : SEARCH_PUBLC
            const searchParams = owner ? {
                user_id: session!.user.id,
                search_term: searchQuery,
                cursor: 1
            } : {
                search_term: searchQuery,
                cursor: 1
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