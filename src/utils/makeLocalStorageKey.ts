export default function makeLocalStorageDraftKey(timestamp: string, postId?: number) {
    let localStorageKey = `draft-${timestamp}`;
    if (postId) localStorageKey = `post-${postId};${localStorageKey}`;

    return localStorageKey
}