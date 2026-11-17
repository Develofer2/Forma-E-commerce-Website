export function verifyOrigin(request: Request) {
  const origin = request.headers.get("origin")
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host")
  if (
    origin &&
    host &&
    new URL(origin).host !== host &&
    origin !== process.env.NEXT_PUBLIC_SITE_URL
  )
    throw new Error("Invalid request origin.")
}
export function publicUser(user: {
  id: string
  name: string
  email: string
}) {
  return { id: user.id, name: user.name, email: user.email }
}
export function errorResponse(error: unknown, status = 400) {
  return Response.json(
    {
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
    },
    { status },
  )
}
