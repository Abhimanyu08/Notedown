function getYoutubeEmbedLink(link: string): string {
    if (link.startsWith('https://www.youtube.com/embed')) return link

    // youtube links come in two flavors
    //1. https://www.youtube.com/watch?v=NeOhV4zOxJ4
    //2. https://youtu.be/NeOhV4zOxJ4?t=80

    //maybe we can ask for a string without any ? or / or : or = from the part after the last /
    let embedLink = "https://www.youtube.com/embed/";
    let lastPart = link.match(/\/([^\/]*)$/)?.at(1)

    let videoId = lastPart?.match(/watch\?v=(.*)$/)?.at(1)
    videoId = videoId?.replace(/\&#x26;t/g, '?start')
    if (videoId) {
        embedLink = embedLink + `${videoId}`
        console.log(embedLink)
        return embedLink
    }

    let match = lastPart?.match(/([^\?=]*)(\?t=(\d*))?/)
    videoId = match?.at(1)
    let time = match?.at(3)

    embedLink = embedLink + `${videoId}`

    if (time) embedLink = embedLink + `?start=${time}`

    return embedLink
}

export default getYoutubeEmbedLink