import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    if (path) {
        if (path.startsWith("/profile")) {
            revalidatePath(path, "layout")
            return
        }
        revalidatePath(path, "page")
        return NextResponse.json({ revalidated: true, now: Date.now() })
    }
    return NextResponse.json({ revalidated: false, now: Date.now() })
}