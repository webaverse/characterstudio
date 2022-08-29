import { api } from "api"

export const loginRequest = async param => {
  try {
    const { data } = await api.post("/api/v2/session", param)
    return data.token
  } catch (error) {
    return null
  }
}

export const logoutRequest = async () => {
  try {
    await api.delete("/api/v2/session")
  } catch (error) {}
}

export const userinfoRequest = async () => {
  try {
    const { data } = await api.get("/api/v2/session")
    return data
  } catch (error) {
    return null
  }
}
