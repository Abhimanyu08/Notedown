function formatDate(date: Date | string): string {

    let dateString: string
    if (typeof date === "string") {
        dateString = new Date(date).toDateString().slice(4)
    }
    else {

        dateString = date.toDateString().slice(4)
    }


    const dmy = dateString.split(" ")

    return `${dmy[1]} ${dmy[0]}, ${dmy[2]}`
}

export default formatDate