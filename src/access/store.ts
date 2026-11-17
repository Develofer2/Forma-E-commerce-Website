import type { Access, FieldAccess } from "payload"

export const isAdmin: Access = ({ req }) => req.user?.collection === "admins"
export const adminField: FieldAccess = ({ req }) =>
  req.user?.collection === "admins"
export const isShopper: Access = ({ req }) => req.user?.collection === "users"
export const ownRecord: Access = ({ req }) => {
  if (req.user?.collection === "admins") return true
  if (req.user?.collection !== "users") return false
  return { owner: { equals: req.user.id } }
}
