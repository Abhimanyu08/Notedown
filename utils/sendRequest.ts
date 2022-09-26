export async function sendRequestToRceServer(method: "POST" | "DELETE", body: { language?: string, containerId?: string, code?: string }) {
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
    await fetch(`/api/revalidate?token=${process.env.NEXT_PUBLIC_REVALIDATE_TOKEN}`, {
        method: "POST",
        body: JSON.stringify({ pathToRevalidate })
    });
}
