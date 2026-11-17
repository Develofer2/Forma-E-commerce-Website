import { appAuth } from "@/lib/app-auth"
import { getPayloadClient } from "@/lib/payload"
import { errorResponse, publicUser, verifyOrigin } from "@/lib/http"

export async function GET() {
  const user = await appAuth.currentUser()
  return Response.json({ user: user ? publicUser(user) : null }, {
    headers: { "Cache-Control": "private, no-store" },
  })
}
export async function POST(request: Request) {
  try {
    verifyOrigin(request)
    const body = await request.json()
    if (body.action === "logout") {
      await appAuth.logout()
      return Response.json({ user: null })
    }
    if (
      typeof body.email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) ||
      body.email.length > 254
    )
      throw new Error("Enter a valid email address.")
    if (
      typeof body.password !== "string" ||
      body.password.length < 8 ||
      body.password.length > 128
    )
      throw new Error("Use a password between 8 and 128 characters.")
    const email = body.email.trim().toLowerCase()
    if (body.action === "register") {
      if (
        typeof body.name !== "string" ||
        !body.name.trim() ||
        body.name.length > 100
      )
        throw new Error("Please enter your name.")
      const payload = await getPayloadClient()
      await payload.create({
        collection: "users",
        overrideAccess: false,
        data: { name: body.name.trim(), email, password: body.password },
      })
    } else if (body.action !== "login") throw new Error("Invalid action.")
    const user = await appAuth.login(email, body.password)
    return Response.json({ user: publicUser(user) })
  } catch {
    return errorResponse(
      new Error(
        "Unable to sign in. Check your details, or try another email when creating an account.",
      ),
    )
  }
}
