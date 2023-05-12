import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareSupabaseClient({ req, res })
    await supabase.auth.getSession()
    return res
}