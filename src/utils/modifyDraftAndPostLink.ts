import { ReadonlyURLSearchParams } from "next/navigation";

export default function modifyDraftAndPostLink(href: string, searchParams: ReadonlyURLSearchParams | null, tag?: string) {
    if (!searchParams) return href

    if (tag) href += `&tag=${tag}`

    if (searchParams?.has("showtag") && searchParams.get("showtag")) {
        href = href + `&showtag=${searchParams.get("showtag")}`;
    }

    if (searchParams?.has("q") && searchParams.get("q")) {
        href = href + `&q=${searchParams.get("q")}`;
    }
    return href
}


export function checkOnPreview(pathname: string | null, searchParams: ReadonlyURLSearchParams | null, href: string) {


    if (!searchParams || !pathname) return pathname === href

    const hrefSplit = href.split(/[?&]/)
    const hrefPath = hrefSplit[0]

    let pathMatches = pathname === hrefPath
    if (!pathMatches) return pathMatches
    for (let keyVal of hrefSplit.slice(1, undefined)) {
        const keyValSplit = keyVal.split("=")
        if (searchParams.get(keyValSplit[0]) !== keyValSplit[1]) {
            return false
        }
    }

    return true

}