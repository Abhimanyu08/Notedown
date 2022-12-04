export function makeFolderName(owner: string, blogId: number | string): string {
    return `${owner}/${blogId}`
}

export function processImageName(imageName: string) {
    // need to preprocess the image name to not have any " " so that they behave well in markdown
    return imageName.split(" ").map(i => i.toLowerCase()).join("-")
}
