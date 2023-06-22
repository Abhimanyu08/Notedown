import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareSupabaseClient({ req, res })
    const { data } = await supabase.auth.getSession()
    if (data.session?.user) {
        if (req.nextUrl.pathname === "/") {
            const url = req.nextUrl.clone()
            url.pathname = `/profile/${data.session.user.id}/posts`
            return NextResponse.redirect(url)
        }
    }
    return res
}