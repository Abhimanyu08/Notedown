import { NextRequest } from "next/server";

export const config = {
    runtime: 'edge'
}

const handler = async (req: NextRequest) => {

    const resp = await fetch(process.env.NEXT_PUBLIC_DOCKER_SERVER as string, {
        method: req.method,
        headers: {
            "Content-Type": "application/json",
        },
        body: req.body,
    });
    console.log(resp.headers)
    const body = await resp.json()

    if (!body) {

        return new Response("", { status: resp.status, headers: { 'content-type': 'application/json' } })
    }

    return new Response(JSON.stringify(body), { status: resp.status, headers: { 'content-type': 'application/json' } })

}

export default handler