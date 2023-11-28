
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from './interfaces/supabase'
import { SUPABASE_POST_TABLE, SUPABASE_SLUGPOST_TABLE } from '@utils/constants'

export async function middleware(req: NextRequest) {
    let res = NextResponse.next({
        request: {
            headers: req.headers,
        },
    })

    const pathname = req.nextUrl.pathname
    if (pathname.startsWith("/profile")) {
        const url = req.nextUrl.clone()

        const profileId = pathname.split("/").at(-1)
        // url.basePath = "/notebook"
        url.pathname = "/notebook" + "/" + profileId
        return NextResponse.redirect(url)
    }
    if (pathname.startsWith("/post")) {

        const url = req.nextUrl.clone()
        const noteId = pathname.split("/").slice(2).join("/")
        // url.basePath = "/notebook"
        url.pathname = "/note" + "/" + noteId
        return NextResponse.redirect(url)
    }


    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return req.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    req.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    res = NextResponse.next({
                        request: {
                            headers: req.headers,
                        },
                    })
                    res.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    req.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    res = NextResponse.next({
                        request: {
                            headers: req.headers,
                        },
                    })
                    res.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data } = await supabase.auth.getSession()

    if (data.session?.user) {
        if (pathname === "/" || pathname === "/notebook/anon") {
            const url = req.nextUrl.clone()
            url.pathname = `/notebook/${data.session.user.id}`
            return NextResponse.redirect(url)
        }
    }

    if (pathname.startsWith("/note")) {
        const postIdOrSlug = pathname.split("/").at(-1)!
        if (!isNaN(parseInt(postIdOrSlug))) {
            //post/1 or /post/private/1

            const { data } = await supabase.from(SUPABASE_POST_TABLE).select("slug").eq("id", postIdOrSlug).single()
            const slug = data?.slug
            if (!slug) {
                return res
            }
            const newPathname = pathname.split("/").slice(0, -1).join("/") + "/" + slug
            const url = req.nextUrl.clone()
            url.pathname = newPathname
            return NextResponse.redirect(url)
        }
        const slug = postIdOrSlug

        const { data } = await supabase.from(SUPABASE_SLUGPOST_TABLE).select("postid, active").match({ "slug": slug }).single()
        if (!data) return res

        if (data.active) {
            return res
        }

        const { data: postData } = await supabase.from(SUPABASE_POST_TABLE).select("slug").eq("id", data.postid).single()
        if (postData?.slug) {
            const newPathname = pathname.split("/").slice(0, -1).join("/") + "/" + postData.slug
            const url = req.nextUrl.clone()
            url.pathname = newPathname
            return NextResponse.redirect(url)
        }

        const newPathname = pathname.split("/").slice(0, -1).join("/") + "/" + data.postid
        const url = req.nextUrl.clone()
        url.pathname = newPathname
        return NextResponse.redirect(url)
    }
    return res
}
