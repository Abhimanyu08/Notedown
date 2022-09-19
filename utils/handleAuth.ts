import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

export const handleSignIn = async (provider: "github" | "google", redirectTo: string) => {
    const hostname = window.location.hostname
    let redirectUrl
    if (hostname === "localhost") {
        redirectUrl = `http://localhost:3000${redirectTo}`
    } else {
        redirectUrl = `${window.location.protocol}/${window.location.hostname}${redirectTo}`
    }

    console.log(redirectUrl)
    const { error } = await supabase.auth.signIn(
        {
            provider,
        },
        { redirectTo: redirectUrl }
    );
    if (error) {
        alert(error.message);
        return;
    }
}

export const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        alert(error.message);
        console.log(error);
        return;
    }
};

// export const notifyServer = (event: AuthChangeEvent, session: Session | null) => {
//     fetch("/api/auth", {
//         method: "POST",
//         headers: new Headers({
//             "Content-Type": "application/json",
//         }),
//         credentials: "same-origin",
//         body: JSON.stringify({ event, session }),
//     }).catch((err) => console.log(err.message));
// }