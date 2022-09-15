export async function sendRequestToRceServer(method: "POST" | "DELETE", body: { language?: string, containerId?: string, code?: string }) {
    const url = new URL(process.env.NEXT_PUBLIC_DOCKER_SERVER as string)
    url.port = "80"
    const resp = fetch(url, {
        method,
        mode: "cors",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    return resp
}

export async function sendRevalidationRequest(pathToRevalidate: string) {
    await fetch(`/api/revalidate?secret=${process.env.NEXT_PUBLIC_REVALIDATE_TOKEN}`, {
        method: "POST",
        body: JSON.stringify({ pathToRevalidate })
    });
}
