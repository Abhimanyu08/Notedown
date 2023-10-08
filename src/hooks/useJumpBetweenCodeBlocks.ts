import { BlogStateInterface } from "@components/BlogPostComponents/BlogState";
import { useEffect } from "react";

export function useJumpBetweenCodeBlocks({ blogState }: { blogState: BlogStateInterface }) {
    useEffect(() => {
        if (Object.keys(blogState.blockToEditor).length === 0) return;
        document.onkeydown = function (event) {
            if (
                event.ctrlKey &&
                (event.key === "ArrowUp" || event.key === "ArrowDown")
            ) {
                event.preventDefault();

                let focusedElement = document.activeElement;
                console.log(focusedElement)
                if (!focusedElement?.classList.contains("cm-content") || focusedElement?.getAttribute("data-language") === "markdown") return
                while (
                    focusedElement !== null &&
                    !focusedElement.id.startsWith("codearea")
                ) {
                    focusedElement = focusedElement?.parentElement || null;
                }
                if (
                    focusedElement &&
                    focusedElement.id.startsWith("codearea-")
                ) {
                    const blockNumber = parseInt(
                        focusedElement.id.split("-")[1]
                    );

                    if (event.key === "ArrowUp") {
                        const previousBlockNumber = blockNumber - 1;
                        const previousElement = document.getElementById(
                            `codearea-${previousBlockNumber}`
                        );
                        if (previousElement && Object.hasOwn(blogState.blockToEditor, previousBlockNumber)) {
                            blogState.blockToEditor[
                                previousBlockNumber
                            ].focus();
                            previousElement.scrollIntoView();
                        }
                    } else if (event.key === "ArrowDown") {
                        const nextBlockNumber = blockNumber + 1;
                        const nextElement = document.getElementById(
                            `codearea-${nextBlockNumber}`
                        );
                        if (nextElement && Object.hasOwn(blogState.blockToEditor, nextBlockNumber)) {
                            blogState.blockToEditor[nextBlockNumber].focus();
                            nextElement.scrollIntoView();
                        }
                    }
                }
            }
        }
    }, [blogState]);


}