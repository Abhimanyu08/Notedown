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
    let searchParamString = ""
    let i = 0
    for (let [key, val] of Array.from(searchParams.entries())) {
        if (i !== 0) searchParamString += "&"
        searchParamString += `${key}=${val}`
        i += 1
    }



    return pathname + "?" + searchParamString === href

}