import { useSupabase } from "@/app/appContext";
import { EditorView } from "@codemirror/view";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import { IndexedDbContext } from "@components/Contexts/IndexedDbContext";
import { SUPABASE_FILES_BUCKET } from "@utils/constants";
import { useContext, useEffect, useState } from "react";

export default function useRecoverSandpack({ persistanceKey }: { persistanceKey: string }) {

    const { blogState } = useContext(BlogContext);
    const { documentDb } = useContext(IndexedDbContext)
    const [jsonConfigString, setJsonConfigString] = useState("")

    const { supabase, session } = useSupabase();

    useEffect(() => {
        // if this config file exists in database download it and then put the config string in jsoneditor
        if (session && session.user && blogState.uploadedFileNames?.includes(`${persistanceKey}.json`)) {
            const { id } = blogState.blogMeta;
            const fileName = `${session?.user?.id}/${id}/${persistanceKey}.json`;

            supabase.storage
                .from(SUPABASE_FILES_BUCKET)
                .download(fileName)
                .then((val) => {
                    const { data } = val;
                    if (data) {
                        data.text().then((jsonString) => {
                            setJsonConfigString(jsonString)
                        });
                    }
                });
            return
        }
        if (!documentDb) return
        const sandpackObjectStore = documentDb
            .transaction("sandpackConfigs", "readonly")
            .objectStore("sandpackConfigs")

        const request = sandpackObjectStore.get(persistanceKey);

        request.onsuccess = (e) => {
            const { config } = (
                e.target as IDBRequest<{ timeStamp: string; config: string }>
            ).result;
            setJsonConfigString(config)
        };

    }, [blogState.uploadedFileNames, session, documentDb]);


    return jsonConfigString
}