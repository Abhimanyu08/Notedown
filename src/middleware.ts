import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SUPABASE_POST_TABLE, SUPABASE_SLUGPOST_TABLE } from '@utils/constants'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from './interfaces/supabase'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareSupabaseClient<Database>({ req, res })
    const { data } = await supabase.auth.getSession()
    const pathname = req.nextUrl.pathname
    if (data.session?.user) {
        if (pathname === "/" || pathname === "/profile/anon") {
            const url = req.nextUrl.clone()
            url.pathname = `/profile/${data.session.user.id}`
            return NextResponse.redirect(url)
        }
    }

    if (pathname.startsWith("/post")) {
        const postIdOrSlug = pathname.split("/").at(-1)!
        if (!isNaN(parseInt(postIdOrSlug))) {
            //post/1 or /post/private/1

            const { data } = await supabase.from(SUPABASE_POST_TABLE).select("slug").eq("id", postIdOrSlug).single()
            const slug = data?.slug
            if (!slug) {
                return res
            }
            const newPathname = pathname.split("/").slice(0, -1).join("/") + "/" + slug
            console.log(newPathname)
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
            console.log(newPathname)
            const url = req.nextUrl.clone()
            url.pathname = newPathname
            return NextResponse.redirect(url)
        }
        return res
    }
    return res
}