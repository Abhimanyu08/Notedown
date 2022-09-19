import { NextApiRequest, NextApiResponse } from "next";


const handler = async (req: NextApiRequest, res: NextApiResponse) => {

    const resp = await fetch(process.env.NEXT_PUBLIC_DOCKER_SERVER as string, {
        method: req.method,
        mode: "cors",
        headers: {
            "Content-Type": "application/json",
            "Origin": req.headers.origin as string
        },
        body: req.body,
    });


    const body = await resp.json()

    if (!body) {
        res.status(400).end()
    }
    res.status(resp.status).json(body)

}

export default handler