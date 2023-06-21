import tokenizer from "./tokenizer"

export type TextNode = {
    tagName: "text",
    text: string
}

export type HtmlNode = {
    tagName: keyof HTMLElementTagNameMap,
    attributes: Record<string, string>,
    children: Array<TextNode | HtmlNode>
}

function attrStringToObj(attrString: string) {

    if (!attrString) return {}
    const re = /(\w+)="(.*?)"/g
    const matchArray = attrString.matchAll(re);

    const obj: Record<string, string> = {}
    Array.from(matchArray).forEach((m) => obj[m[1]] = m[2])
    return obj
}

export default function parser(tokens: ReturnType<typeof tokenizer>) {

    let current = -1

    let node: HtmlNode = {
        tagName: "main",
        attributes: {},
        children: []
    }
    if (tokens.length === 0) return node

    function addChildren(parent: HtmlNode) {
        current++
        let token = tokens[current]
        if (!token) return
        while (!(token.type === "close tag" && token.name === parent.tagName)) {
            if (token.type === "text") {
                parent.children.push({ tagName: "text", text: token.text } as TextNode)
                current++
                token = tokens[current]
                continue
            }

            if (token.type === "open tag") {
                let newNode: HtmlNode = {
                    tagName: token.name,
                    attributes: attrStringToObj(token.attrString),
                    children: []
                }

                if (!token.selfClosing) {
                    addChildren(newNode)
                }


                parent.children.push(newNode)
            }
            current++
            token = tokens[current]
            if (!token) break
            // console.log(token)
        }
    }

    addChildren(node)
    return node
}