import { remark } from 'remark'
import html from "remark-html";

import { Handler, defaultHandlers, Handlers } from "mdast-util-to-hast";

import { fromMarkdown } from 'mdast-util-from-markdown'
import { toHast } from 'mdast-util-to-hast'
import { raw } from 'hast-util-raw'
import { sanitize, defaultSchema } from 'hast-util-sanitize'
import { toHtml } from 'hast-util-to-html'
// const code: Handler = (state, node) => {


//     console.log(node)
//     return {
//         type: "element",
//         tagName: "pre",
//         properties: { "language": node.lang },
//         data: { "language": node.lang },
//         children: [{ type: "element", tagName: "code", children: state.all(node) }]
//     }
// }
const attributes: typeof defaultSchema["attributes"] = { "*": ["className"], "img": ["alt", "src"], "a": ["href"] }

export default function mdToHtml(markdown: string) {
    const mdast = fromMarkdown(markdown)
    const hast = raw(toHast(mdast, { allowDangerousHtml: true })!)
    const safeHast = sanitize(hast, { attributes })
    const html = toHtml(safeHast)
    return html

}

