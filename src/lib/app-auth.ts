import "server-only"
import { cookies } from "next/headers"
import { getPayloadClient } from "@/lib/payload"

export function createAppAuth(appUserCollection: "users") {
  const inMakePreview = Boolean(process.env.FIGMA_PUBLIC_URL)
  const options = {
    httpOnly: true,
    secure: inMakePreview || process.env.NODE_ENV === "production",
    sameSite: (inMakePreview ? "none" : "lax") as "none" | "lax",
    // Keep the embedded preview session isolated from other top-level sites.
    partitioned: inMakePreview,
    path: "/",
  }
  return {
    async currentUser() {
      const token = (await cookies()).get("app-session")?.value
      if (!token) return null
      const payload = await getPayloadClient()
      try {
        const { user } = await payload.auth({
          headers: new Headers({ Authorization: `JWT ${token}` }),
        })
        return user?.collection === appUserCollection ? user : null
      } catch {
        return null
      }
    },
    async login(email: string, password: string) {
      const payload = await getPayloadClient()
      const result = await payload.login({
        collection: appUserCollection,
        data: { email, password },
      })
      if (!result.token || !result.user) throw new Error("Unable to sign in.")
      ;(await cookies()).set("app-session", result.token, {
        ...options,
        maxAge: 60 * 60 * 24 * 7,
      })
      return result.user
    },
    async logout() {
      ;(await cookies()).set("app-session", "", { ...options, maxAge: 0 })
    },
  }
}
export const appAuth = createAppAuth("users")
