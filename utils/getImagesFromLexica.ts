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


async function getImagesFromLexica({ caption }: { caption: string }) {

    if (caption === "") return ""
    const resp = await fetch(`https://lexica.art/api/v1/search?q=${caption}`, {
        method: "GET"
    })
    const respObj = await resp.json() as { images: LexicaResponse[] }

    return respObj.images.at(1)?.srcSmall
}


export default getImagesFromLexica