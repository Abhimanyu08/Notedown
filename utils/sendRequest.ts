async function sendRequest(method: "POST" | "PUT", url: string, body: { language: string, containerId?: string, code?: string }) {
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

export default sendRequest