export async function sendRequestToRceServer(method: "POST", body: { language: string, containerId?: string, code?: string }) {
    const resp = fetch(process.env.NEXT_PUBLIC_DOCKER_SERVER as string, {
        method,
        mode: "cors",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    return resp
    // await fetch(`/api/rce`, {
    //     method: "POST",
    //     body: JSON.stringify(body)
    // });
}

export async function sendRevalidationRequest(pathToRevalidate: string) {
    await fetch(`/api/revalidate?secret=${process.env.NEXT_PUBLIC_REVALIDATE_TOKEN}`, {
        method: "POST",
        body: JSON.stringify({ pathToRevalidate })
    });
}
