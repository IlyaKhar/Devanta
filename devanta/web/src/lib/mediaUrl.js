/** URL для <img>: /uploads, полный https, slug Unsplash без домена. */
export function mediaUrl(path) {
    const p = (path ?? "").trim();
    if (!p)
        return "";
    const lower = p.toLowerCase();
    if (/^https?:\/\//i.test(p))
        return p;
    if (p.startsWith("//"))
        return `https:${p}`;
    if (p.startsWith("/")) {
        if (typeof window === "undefined")
            return p;
        return `${window.location.origin}${p}`;
    }
    if (lower.startsWith("images.unsplash.com/"))
        return `https://${p}`;
    if (/^photo-\d/i.test(p))
        return `https://images.unsplash.com/${p}`;
    if (typeof window === "undefined")
        return `/${p}`;
    return `${window.location.origin}/${p}`;
}
