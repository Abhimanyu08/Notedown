import { useEffect, useState } from "react";
import { getImages } from "../../utils/sendRequest";

export default function useLexica({ content }: { content?: string }) {
    const [lexicaLinks, setLexicaLinks] = useState<string[]>([]);
    const [lexicaLinkNumber, setLexicaLinkNumber] = useState(0);

    useEffect(() => {
        const regenButton = document
            .getElementsByClassName("lexica-regen")
            .item(0) as HTMLDivElement | null;

        if (!regenButton) return;
        regenButton.onclick = (e) => {
            setLexicaLinkNumber((prev) => {
                return (prev + 1) % lexicaLinks.length;
            });
        };
    }, [content, lexicaLinks]);

    useEffect(() => {
        const captions: string[] = [];
        const lexicaImageElem = Array.from(
            document.getElementsByClassName("lexica")
        ).at(0);
        if (!lexicaImageElem) return;
        captions.push((lexicaImageElem as HTMLImageElement).alt);
        getImages({ caption: captions[0] }).then((imageLinks) => {
            setLexicaLinks(imageLinks);
            setLexicaLinkNumber(0);
        });
    }, [content]);

    useEffect(() => {
        const lexicaImageElem = Array.from(
            document.getElementsByClassName("lexica")
        ).at(0);
        if (!lexicaImageElem) return;
        (lexicaImageElem as HTMLImageElement).src =
            lexicaLinks[lexicaLinkNumber];
    }, [lexicaLinkNumber, lexicaLinks]);


}