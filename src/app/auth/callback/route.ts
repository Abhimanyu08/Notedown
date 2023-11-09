import { createSupabaseServerClient } from '@utils/createSupabaseClients'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    console.log(searchParams.get("next"), request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {

        const supabase = createSupabaseServerClient(cookies)
        const url = request.nextUrl.clone()
        url.pathname = next
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(url)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect('/auth/auth-code-error')
}