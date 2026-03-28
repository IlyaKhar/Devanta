/** Декодирует payload JWT (без проверки подписи) — только для role после логина. */
export function decodeJwtPayload(token) {
    try {
        const part = token.split(".")[1];
        if (!part)
            return null;
        const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
        const pad = b64.length % 4;
        const padded = b64 + (pad ? "=".repeat(4 - pad) : "");
        const json = JSON.parse(atob(padded));
        return json;
    }
    catch {
        return null;
    }
}
