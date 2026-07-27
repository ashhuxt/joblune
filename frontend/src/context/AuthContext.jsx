import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { authApi } from '../api/client'



const AuthContext = createContext(null)



function readStoredUser() {

try {

const raw = localStorage.getItem('user')

return raw ? JSON.parse(raw) : null

} catch {

return null

}

}



export function AuthProvider({ children }) {

const [user, setUser] = useState(null)

const [token, setToken] = useState('')

const [loading, setLoading] = useState(true)



useEffect(() => {

const storedToken = localStorage.getItem('token') || ''

const storedUser = readStoredUser()



setToken(storedToken)

setUser(storedUser)

setLoading(false)

}, [])



async function login(email, password) {

const normalizedEmail = email.trim().toLowerCase()

const res = await authApi.login({ email: normalizedEmail, password })



const nextToken = res.token || res.accessToken || ''

const nextUser =

res.user || {

id: res.id,

email: res.email,

fullName: res.fullName,

role: res.role

}



localStorage.setItem('token', nextToken)

localStorage.setItem('user', JSON.stringify(nextUser))



setToken(nextToken)

setUser(nextUser)



return nextUser

}



async function signup(payload) {

const request = {

username: payload.username,

email: payload.email.trim().toLowerCase(),

password: payload.password,

fullName: payload.fullName,

role: payload.role

}



const res = await authApi.signup(request)



const nextToken = res.token || res.accessToken || ''

const nextUser =

res.user || {

id: res.id,

email: res.email,

fullName: res.fullName,

role: res.role

}



localStorage.setItem('token', nextToken)

localStorage.setItem('user', JSON.stringify(nextUser))



setToken(nextToken)

setUser(nextUser)



return nextUser

}



function logout() {

localStorage.removeItem('token')

localStorage.removeItem('user')

setToken('')

setUser(null)

}



const value = useMemo(

() => ({

user,

token,

isAuthenticated: Boolean(token),

loading,

login,

signup,

logout

}),

[user, token, loading]

)



return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>

}



export function useAuth() {

const ctx = useContext(AuthContext)

if (!ctx) {

throw new Error('useAuth must be used within AuthProvider')

}

return ctx

} 

