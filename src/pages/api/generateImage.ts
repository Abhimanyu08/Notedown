import { NextApiRequest, NextApiResponse } from "next";
interface LexicaResponse {
    id: string,
    gallery: string,
    src: string,
    srcSmall: string,
    prompt: string,
    width: number,
    height: number,
    seed: string,
    grid: boolean,
    model: string,
    promptid: string,
    nsfw: boolean
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

    const { q } = req.query
    const lexicaResp = await fetch(`${process.env.NEXT_PUBLIC_LEXICA_API}?q=${q}`, {
        method: "GET"
    });


    if (!lexicaResp.body) {

        res.status(lexicaResp.status).json({ error: lexicaResp.statusText })
    }
    const lexicaRespBody = await lexicaResp.json() as { images: LexicaResponse[] }
    const resBody = lexicaRespBody.images.map(val => val.srcSmall)
    res.setHeader(`s-maxage`, 60 * 60 * 24 * 30) //cache for a month
    res.status(lexicaResp.status).json({ links: resBody })
}

export default handler