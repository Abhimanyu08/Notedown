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

        document.onkeydown = (e) => {
            if (keys.includes(e.key)) {
                keyArray.current.add(e.key);
                console.log("keydown", e.key, keyArray.current)
                if (keys.length === keyArray.current.size) {
                    callback()
                }
            }
        }
        document.onkeyup = (e) => {
            keyArray.current.delete(e.key)
            console.log("keyup", e.key, keyArray.current)
        }
    }, [])

}