export default function makeFolderName(owner: string, blogId: number | string): string {
    return `${owner}/${blogId}`
}
