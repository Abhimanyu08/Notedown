import { useSupabase } from "@/app/appContext";
import { EditorContext } from "@/app/write/components/EditorContext";
import { EditorView } from "@codemirror/view";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import { SUPABASE_FILES_BUCKET } from "@utils/constants";
import { useContext, useEffect } from "react";

export default function useRecoverSandpack({ jsonEditorView, persistanceKey }: { persistanceKey: string, jsonEditorView: EditorView | null }) {

    const { blogState } = useContext(BlogContext);
    const { editorState } = useContext(EditorContext);

    const { supabase, session } = useSupabase();

    useEffect(() => {
        // if this config file exists in database download it and then put the config string in jsoneditor
        if (!jsonEditorView) return;
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
                            jsonEditorView?.dispatch({
                                changes: [
                                    {
                                        from: 0,
                                        to: jsonEditorView.state.doc.length,
                                        insert: jsonString,
                                    },
                                ],
                            });
                        });
                    }
                });
            return
        }
        if (!editorState.documentDb) return
        const sandpackObjectStore = editorState.documentDb
            .transaction("sandpackConfigs", "readonly")
            .objectStore("sandpackConfigs")

        const request = sandpackObjectStore.get(persistanceKey);

        request.onsuccess = (e) => {
            const { config } = (
                e.target as IDBRequest<{ timeStamp: string; config: string }>
            ).result;
            console.log(config)
            jsonEditorView?.dispatch({
                changes: [
                    {
                        from: 0,
                        to: jsonEditorView.state.doc.length,
                        insert: config,
                    },
                ],
            });
        };

    }, [jsonEditorView, blogState.uploadedFileNames, session, editorState.documentDb]);


}