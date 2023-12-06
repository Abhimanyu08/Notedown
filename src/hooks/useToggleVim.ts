import { vim } from "@replit/codemirror-vim";
import { useState, useEffect, useCallback } from "react";

import { StateEffect } from "@codemirror/state";

import { Compartment } from "@codemirror/state";
import { EditorView } from "codemirror";
export default function useToggleVim({ editorView }: { editorView: EditorView | null }) {
    const [vimCompartment, setVimCompartment] = useState<Compartment>();
    const [vimEnabled, setVimEnabled] = useState(false);

    useEffect(() => {
        if (!vimCompartment) {
            const compartment = new Compartment();
            setVimCompartment(compartment);
        }
    }, []);

    const toggleVim = useCallback(() => {
        if (!editorView) return;

        if (!vimEnabled) {
            editorView.dispatch({
                effects: StateEffect.appendConfig.of(vimCompartment!.of(vim())),
                // editorState.editorView.state.facet()
            });
        }
        // C
        if (vimEnabled) {
            editorView.dispatch({
                effects: vimCompartment?.reconfigure([]),
            });
            //we need to set a new compartment for next time someone enables vim
            const compartment = new Compartment();
            setVimCompartment(compartment);
        }
        setVimEnabled((prev) => !prev);
    }, [vimEnabled, editorView])

    return { vimEnabled, toggleVim }
}