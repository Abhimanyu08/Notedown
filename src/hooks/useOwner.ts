import { useSupabase } from "@/app/appContext";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function useOwner(userId?: string) {
    //hooks used to test if the profile page is being viewed by its owner or a different user
    const [owner, setOwner] = useState(false)
    const { supabase } = useSupabase()
    const params = useParams()

    useEffect(() => {
        supabase.auth.onAuthStateChange((_, session) => {

            if (params?.id === "anon") {
                setOwner(true)
                return
            }
            if (!session?.user.id) {
                return
            }

            if (userId) {
                if (userId !== session.user.id) return
                setOwner(true)
                return
            }

            if (!params || !params.id) {
                return
            }

            if (params.id === session.user.id) setOwner(true)

        })

    }, [supabase])

    return owner
}

export default useOwner