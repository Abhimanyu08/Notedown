const selfClosingTagNames = ["img", "br"]

export type NodeToken = {
    name: keyof HTMLElementTagNameMap,
    type: "open tag" | "close tag",
    attrString: string,
    selfClosing: boolean
}

export type TextToken = {
    type: "text",
    text: string
}


export default function tokenizer(html: string): Array<NodeToken | TextToken> {

    let i = 0
    let tokens = []

    while (i < html.length) {

        let char = html[i]

        if (char === "<") {

            i++
            char = html[i]
            let type: NodeToken["type"] = "open tag"

            if (char === "/") {
                i++
                char = html[i]
                type = "close tag"
            }



            let tagName = ""

            while (!(char === ">" || char === " ")) {

                tagName += char
                i++
                char = html[i]

            }

            let attrString = ''

            if (char !== ">") {
                i++
                char = html[i]

                while (char !== ">") {

                    attrString += char
                    i++
                    char = html[i]
                }
            }


            tokens.push({
                name: tagName as keyof HTMLElementTagNameMap,
                type,
                attrString,
                selfClosing: selfClosingTagNames.includes(tagName)
            })

            i++
            continue

        }
        if (/([^<])/.test(char)) {
            let text = ""

            while (char !== "<") {
                text += char
                i++
                char = html[i]
            }

            tokens.push({
                type: "text",
                text
            } as TextToken)
        }

    }

    return tokens

}