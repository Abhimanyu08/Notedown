import formatDate from "./dateFormatter";
import { parseFrontMatter } from "./getResources";
import { getMarkdownObjectStore } from "./indexDbFuncs";
export type Draft = {
    timeStamp: string;
    time: string;
    date: string;
    draftMeta: ReturnType<typeof parseFrontMatter>["data"];
    postId?: string;
};

export type RawObject = { timeStamp: string, markdown: string, postId?: string }

export function processDrafts(db: IDBDatabase) {

    return new Promise<Draft[]>((res) => {

        let objectStore = getMarkdownObjectStore(db);
        const markdownIndex = objectStore.index("markdownIndex")

        const draftsToAdd: Draft[] = [];
        markdownIndex.openCursor().onsuccess = (e) => {


            const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {

                const draft = rawObjectToDraft(cursor.value as { timeStamp: string, markdown: string, postId?: string })

                draftsToAdd.push(draft);
                cursor.continue()
            } else {
                res(draftsToAdd.sort(
                    (a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp)
                ))
            }
        };
    })
}


export function rawObjectToDraft({ timeStamp, markdown, postId }: RawObject): Draft {

    timeStamp = /(draft-)?(\d+)$/.exec(timeStamp)!.at(2)!
    const { data } = parseFrontMatter(markdown);
    const formattedTimeStamp = new Date(parseInt(timeStamp));
    const date = formatDate(formattedTimeStamp);
    const longTime = formattedTimeStamp.toLocaleTimeString();

    const amOrPm = longTime.match(/[ap]m/)?.at(0);
    const shortTime = longTime.split(":").slice(0, 2).join(":");
    const time = `${shortTime} ${amOrPm}`;

    return {
        timeStamp,
        date,
        time,
        draftMeta: data,
        postId,
    }

}

