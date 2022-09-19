import { NextApiResponse } from "next";
import { NextRequest } from "next/server";

export const config = {
    runtime: 'experimental-edge'
}

const handler = async (req: NextRequest) => {

    const resp = await fetch(process.env.NEXT_PUBLIC_DOCKER_SERVER as string, {
        method: req.method,
        mode: "cors",
        headers: {
            "Content-Type": "application/json",
        },
        body: req.body,
    });


    const body = await resp.json()

    if (!body) {

        return new Response("", { status: resp.status, headers: { 'content-type': 'application/json' } })
    }

    return new Response(JSON.stringify(body), { status: resp.status, headers: { 'content-type': 'application/json' } })

}

export default handler