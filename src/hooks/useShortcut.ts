import { useEffect, useRef } from "react";

interface useShortcutProps {
    keys: string[]
    callback: () => void
}


export default function useShortCut({
    keys,
    callback
}: useShortcutProps) {


    const keyArray = useRef<Set<string>>(new Set())


    useEffect(() => {
        document.addEventListener("keydown", (e) => {
            if (keys.includes(e.key)) keyArray.current.add(e.key);
            if (keys.length === keyArray.current.size) {
                console.log("pressing Alt-p");
                callback()
            }
        });
        document.addEventListener("keyup", () => {
            keyArray.current.clear();
        });
    }, []);

}