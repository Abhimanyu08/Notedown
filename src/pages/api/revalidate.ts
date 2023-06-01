import { NextApiRequest, NextApiResponse } from "next";


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.query.token !== process.env.NEXT_PUBLIC_REVALIDATE_TOKEN) {
        return res.status(401).json({ message: "Invalid token" })
    }

    try {
        const { pathToRevalidate } = JSON.parse(req.body)
        console.log(pathToRevalidate)
        await res.revalidate(pathToRevalidate)
        return res.json({ revalidated: true })

    } catch (err) {
        console.log(err)
        return res.status(500).send('Error revalidating')
    }
}

export default handler