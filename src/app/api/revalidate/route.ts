import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    if (path) {
        console.log(path)
        revalidatePath(path)
        return NextResponse.json({ revalidated: true, now: Date.now() })
    }
    return NextResponse.json({ revalidated: false, now: Date.now() })
}