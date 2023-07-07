import { NextApiRequest, NextApiResponse } from "next";


const handler = async (req: NextApiRequest, res: NextApiResponse) => {

    const { q } = req.query
    // const lexicaResp = await fetch(`${process.env.NEXT_PUBLIC_LEXICA_API}?q=${q}`, {
    //     method: "GET"
    // });
    const body = JSON.stringify({
        prompt: q,
        n: 5,
        size: "512x512",
        response_format: "b64_json"

    })
    const openAiResp = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {

            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENAI_KEY}`,
            "Content-Type": "application/json"
        },
        body
    })

    const data = await openAiResp.json()
    console.log(data)

    if (!data) {

        res.status(openAiResp.status).json({ error: openAiResp.statusText })
        return
    }
    if (data.error) {
        res.status(403).json({ error: data.error.message })
        return
    }
    // const lexicaRespBody = await lexicaResp.json() as { images: LexicaResponse[] }
    // const resBody = lexicaRespBody.images.map(val => val.srcSmall)
    // res.setHeader(`s-maxage`, 60 * 60 * 24 * 30) //cache for a month
    // res.status(lexicaResp.status).json({ links: resBody })
    res.status(openAiResp.status).json(data.data)
}

export const config = {
    api: {
        responseLimit: false
    }
}

export default handler