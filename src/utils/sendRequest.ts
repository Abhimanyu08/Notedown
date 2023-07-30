import { ALLOWED_LANGUAGES } from "./constants";

export async function sendRequestToRceServer(method: "POST" | "DELETE", body: { language?: typeof ALLOWED_LANGUAGES[number] | "shell", containerId?: string, code?: string, fileName?: string, run?: boolean }) {
    if (window.location.hostname === "localhost") {

        const resp = fetch(process.env.NEXT_PUBLIC_DOCKER_SERVER as string, {
            method,
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        return resp
    }

    const resp = await fetch(`/api/sendReqApiRoute`, {
        method,
        body: JSON.stringify(body)
    })
    return resp
}

export async function sendRevalidationRequest(pathToRevalidate: string) {
    await fetch(`/api/revalidate?path=${pathToRevalidate}`, {
        method: "GET",
    });
}

export async function getImages({ caption }: { caption: string }) {

    if (caption === "") return [""]

    const resp = await fetch(`/api/generateImage?q=${caption}`, { method: "GET" })

    const data = await resp.json()

    if (data.error) {
        return data.error as string
    }
    return (data as { b64_json: string }[]).map(l => l.b64_json)
}