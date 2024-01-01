import { createSupabaseServerClient } from '@utils/createSupabaseClients'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'
    console.log("Search params =========================>", Array.from(searchParams.entries()))

    // next can be /write?draft=draftId
    const nextSplit = next.split("?");
    const nextUrl = nextSplit.at(0)!
    const nextSearchParam = nextSplit.at(1)

    if (code) {

        const supabase = createSupabaseServerClient(cookies)
        const url = request.nextUrl.clone()
        url.pathname = nextUrl

        url.searchParams.delete("code")
        url.searchParams.delete("next")
        if (nextSearchParam) {
            const match = /(.*)=(.*)/.exec(nextSearchParam)
            if (match) {
                url.searchParams.set(match[1], match[2])
            }

        }
        for (let [key, val] of Array.from(searchParams.entries())) {
            if (key !== "code" && key !== "next") url.searchParams.set(key, val)
        }

        console.log("Url =============> ", url)

        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(url)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect('/auth/auth-code-error')
}