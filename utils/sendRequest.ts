async function sendRequest(method: "POST", body: { language: string, containerId?: string, code?: string }) {
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

export default sendRequest