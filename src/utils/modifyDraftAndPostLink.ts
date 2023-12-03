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