import { IndexedDbContext } from "@/contexts/IndexedDbContext";
import { useContext, useState, useEffect } from "react";
import useOwner from "./useOwner";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";

export default function useInSync({ markdown }: { markdown: string }) {


    const { blogState } = useContext(BlogContext)
    const { documentDb } = useContext(IndexedDbContext);

    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { blogMeta: noteMeta } = blogState

    const [inSync, setInSync] = useState(true);
    const owner = useOwner(noteMeta.blogger?.id!)

    useEffect(() => {
        if (pathname?.startsWith("/draft") && searchParams?.get("synced") === "false") {
            setInSync(false)
            return
        }
        if (!owner) return
        if (!documentDb) return;
        if (!markdown) return;
        if (!noteMeta.timeStamp) return;

        // let tagPreview = "";
        // if (searchParams?.has("tagpreview")) {
        //     tagPreview = searchParams.get("tagpreview")!;
        // }



        const markdownObjectStoreRequest = documentDb
            .transaction("markdown", "readonly")
            .objectStore("markdown")
            .get(noteMeta.timeStamp);

        markdownObjectStoreRequest.onsuccess = (e) => {
            const { markdown: localMarkdown } = (
                e.target as IDBRequest<{ timeStamp: string; markdown: string }>
            ).result;
            if (localMarkdown !== markdown) {
                setInSync(false);
            }
        };
    }, [documentDb, markdown, owner, blogState]);

    return inSync
}