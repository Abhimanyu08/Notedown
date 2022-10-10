function formatDate(date: string): string {

    let dateString = new Date(date).toDateString()

    return `${dateString.slice(4, 10)}/${dateString.slice(13, 15)}`
}

export default formatDate