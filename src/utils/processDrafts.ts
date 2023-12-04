import formatDate from "./dateFormatter";
import { FrontMatter, parseFrontMatter } from "./parseFrontMatter";
import { getMarkdownObjectStore } from "./indexDbFuncs";
export type Draft = {
    timeStamp: string;
    date: string;
    postId?: number;
    published?: boolean
    slug?: string
    created_by?: string
} & FrontMatter;

export type RawObject = { timeStamp: string, markdown: string, postId?: number }

export function processNoTagDrafts(db: IDBDatabase) {
    // this funciton should only return drafts with no tags
    return new Promise<RawObject[]>((res) => {

        let objectStore = getMarkdownObjectStore(db);
        const markdownIndex = objectStore.index("markdownIndex")

        const rawObjs: RawObject[] = [];
        markdownIndex.openCursor().onsuccess = (e) => {


            const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {

                const draft = cursor.value as { timeStamp: string, markdown: string, postId?: number, tags?: string[] }
                const tagArray = draft["tags"]
                if (!Object.hasOwn(draft, "tags") || tagArray === undefined || tagArray.length === 0)
                    rawObjs.push(draft);
                cursor.continue()
            } else {
                res(rawObjs)
            }
        };
    })
}


export function rawObjectToDraft({ timeStamp, markdown, postId }: RawObject): Draft {

    timeStamp = /(draft-)?(\d+)$/.exec(timeStamp)!.at(2)!
    const { data } = parseFrontMatter(markdown);
    const formattedTimeStamp = new Date(parseInt(timeStamp));
    const date = formatDate(formattedTimeStamp);


    return {
        timeStamp,
        date,
        ...data,
        postId,
    }

}

