import { HtmlAstElement } from "./transformer";

export type TagToJsx = {
	[k in keyof HTMLElementTagNameMap]?: (
		node: HtmlAstElement,
		tagToJsxConverter: TagToJsx
	) => JSX.Element;
} & { footnotes?: FootNote[]; BLOCK_NUMBER: 0 };

type FootNote = { id: number; node: any };
