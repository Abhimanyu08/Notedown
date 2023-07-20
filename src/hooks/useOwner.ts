import { useSupabase } from "@/app/appContext";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function useOwner() {
    //hooks used to test if the profile page is being viewed by its owner or a different user
    const [owner, setOwner] = useState(false)
    const { supabase } = useSupabase()
    const params = useParams()

    useEffect(() => {
        supabase.auth.onAuthStateChange((_, session) => {

            if (!session?.user.id) {
                setOwner(false)
                return
            }

            if (!params || !params.id) {
                setOwner(false)
                return
            }

            if (params.id === session.user.id) setOwner(true)
        })

    }, [supabase])

    return owner
}

export default useOwner