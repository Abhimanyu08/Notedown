import { useEffect, useRef } from "react";

interface useShortcutProps {
    keys: string[]
    callback: () => void
    dependencyArray?: any[]
}


export default function useShortCut({
    keys,
    callback,
    dependencyArray
}: useShortcutProps) {


    const keyArray = useRef<Set<string>>(new Set())

    useEffect(() => {

        const keyDown = (e: KeyboardEvent) => {
            if (keys.includes(e.key)) {
                keyArray.current.add(e.key);
                if (keys.length === keyArray.current.size) {

                    console.log("calling callback for keys", keys)
                    callback()
                }
            }
        }
        const keyUp = (e: KeyboardEvent) => {
            keyArray.current.delete(e.key)
        }

        document.addEventListener("keydown", keyDown)
        document.addEventListener("keyup", keyUp)

        return () => {
            console.log("removing callback registered for keys", keys)
            document.removeEventListener("keydown", keyDown)
            document.removeEventListener("keyup", keyUp)
        }
    }, dependencyArray || [])

}