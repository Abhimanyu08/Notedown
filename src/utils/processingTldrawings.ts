import { Editor } from "@tldraw/tldraw";



export default async function editorToJsonFile(editor: any, fileName: string) {
    const json = await tldrawEditorToJsonString(editor)
    if (!json) return
    return new File([json], `${fileName}.json`, { type: "application/json" })

}



async function tldrawEditorToJsonString(editor: Editor) {

    const shapesArray = editor?.getShapeIdsInPage(
        editor.currentPageId
    );
    if (!shapesArray) return;

    const svg = await editor?.getSvg(Array.from(shapesArray), {
        scale: 1,
        background: editor.instanceState.exportBackground,
    });

    if (svg) {

        return svgToJson(svg)
    }
    return null

}

// Assuming you have an SVG element with the id "mySvgElement"

function svgToJson(svgElement: SVGSVGElement) {
    const svgAttributes = svgElement.attributes;
    const svgObject: Record<string, string> = {};

    // Extract attributes and properties
    for (let i = 0; i < svgAttributes.length; i++) {
        const attr = svgAttributes[i];
        svgObject[attr.name] = attr.value;
    }

    // Add SVG tag name to the object
    svgObject.tagName = svgElement.tagName.toLowerCase();

    // If you want to include the inner HTML of the SVG element:
    svgObject.innerHTML = svgElement.innerHTML;

    svgObject;
    return JSON.stringify(svgObject);
}