import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";

function useAuth(loggedInUser: User | null) {
    const [user, setUser] = useState<User | null>(loggedInUser)

    const getUserFromUrl = async () => {
        const { data } = await supabase.auth.getSessionFromUrl();
        if (data) {
            setUser(data.user)
            await fetch("/api/auth", {
                method: "POST",
                headers: new Headers({
                    "Content-Type": "application/json",
                }),
                credentials: "same-origin",
                body: JSON.stringify({ event: "SIGNED_IN", session: data }),
            });
        }
    }

    useEffect(() => {
        if (loggedInUser === null) getUserFromUrl()
    }, [])

    return user
}

export default useAuth