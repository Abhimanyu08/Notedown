import Post from "./Post"
export default interface FileMetadata {
    title: string,
    language?: Post["language"],
    description?: string
}