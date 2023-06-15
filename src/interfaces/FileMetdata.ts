import { ALLOWED_LANGUAGES } from "@utils/constants";

export default interface FileMetadata {
    title: string,
    language?: typeof ALLOWED_LANGUAGES[number],
    description: string
}