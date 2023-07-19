import { useSupabase } from "@/app/appContext";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function useOwner() {
    //hooks used to test if the profile page is being viewed by its owner or a different user
    const [owner, setOwner] = useState(false)
    const { session, supabase } = useSupabase()
    const params = useParams()

    useEffect(() => {
        if (!session?.user.id) return

        if (!params || !params.id) return

        if (params.id === session.user.id) setOwner(true)

    }, [supabase])

    return owner
}

export default useOwner