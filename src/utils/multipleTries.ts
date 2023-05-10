import { PostgrestResponse } from "@supabase/postgrest-js"



export async function tryNTimesSupabaseTableFunction<T>(functionToTry: () => PromiseLike<PostgrestResponse<T>>, totalTrials: number): Promise<T[]> {

    //tries to perform a supabase table operation totalTrial number of times, throws an error if doesn't succeed

    const resp = await functionToTry()
    if (!resp.error && resp.data) return resp.data

    if (totalTrials === 0) throw resp.error

    totalTrials -= 1
    return tryNTimesSupabaseTableFunction(functionToTry, totalTrials)

}

export async function tryNTimesSupabaseStorageFunction(functionToTry: () => Promise<{ data: any | null; error: Error | null }>, totalTrials: number): Promise<{ data: any }> {

    const resp = await functionToTry()

    if (!resp.error && resp.data) return { data: resp.data }

    if (totalTrials === 0) {
        if (resp.error) throw resp.error
        if (!resp.data) throw Error("Supabase did not return any data")
        throw Error("Unexpected Error")
    }

    totalTrials -= 1
    return tryNTimesSupabaseStorageFunction(functionToTry, totalTrials)


}
