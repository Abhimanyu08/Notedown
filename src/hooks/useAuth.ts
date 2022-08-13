import { User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import { notifyServer } from "../../utils/handleAuth";
import { supabase } from "../../utils/supabaseClient";

function useAuth(loggedInUser: User | null) {

    const [user, setUser] = useState(loggedInUser);

    useEffect(() => {
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
            console.log(event)
            setUser(session?.user || null)
            notifyServer(event, session);
        })

        return () => data?.unsubscribe()
    }, [])

    return { user, setUser }

}

export default useAuth