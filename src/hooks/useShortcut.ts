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

        const keyDown = (e) => {
            if (keys.includes(e.key)) {
                keyArray.current.add(e.key);
                if (keys.length === keyArray.current.size) {
                    callback()
                }
            }
        }
        const keyUp = (e) => {
            keyArray.current.delete(e.key)
        }

        document.onkeydown = keyDown
        document.onkeyup = keyUp

        return () => {
            document.removeEventListener("keydown", keyDown)
            document.removeEventListener("keyup", keyUp)
        }
    }, [])

}