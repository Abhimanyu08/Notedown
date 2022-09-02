export default function makeFolderName(owner: string, blogTitle: string): string {
    return `${owner}/${blogTitle.toUpperCase()}`
}
