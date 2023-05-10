function formatDate(date: string): string {

    let dateString = new Date(date).toDateString().slice(4)

    const dmy = dateString.split(" ")

    return `${dmy[1]} ${dmy[0]}, ${dmy[2]}`
}

export default formatDate