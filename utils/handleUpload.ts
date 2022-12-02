interface handleUploadProps {
    markdown: string,
    imagesToUpload: File[]
    drawings: File[]
}

interface handleUpdateProps extends handleUploadProps {
    imagesToDelete: File[]
}

export function handleUpload({ markdown }: handleUploadProps) {


    const newFile = new File([markdown], "");


}


export function handleUpdate({ }: handleUpdateProps) {

}
