import { BlogProps } from "@/interfaces/BlogProps";
import { sendRequestToRceServer } from "@utils/sendRequest";

export default async function prepareContainer(containerId: string, language: BlogProps["language"] | null) {
    if (containerId || !language)
        return;
    try {
        const resp = await sendRequestToRceServer("POST", {
            language: language,
        });

        if (resp.status !== 201) {
            console.log(resp.statusText);
            alert("Couldn't set up remote code execution");
            return;
        }
        const body: { containerId: string; } = await resp.json();
        return body.containerId

    } catch (_) {
        alert("Couldn't enable remote code execution");
    }
}