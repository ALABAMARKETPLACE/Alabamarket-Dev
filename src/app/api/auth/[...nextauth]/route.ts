import NextAuth from 'next-auth'
import { options } from './options'

const handler = NextAuth(options)

// Add custom error handling
export async function GET(request: Request) {
  try {
    return handler(request)
  } catch (error: any) {
    console.error('[NextAuth] GET Error:', error)
    return new Response(
      JSON.stringify({ error: 'Authentication service error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function POST(request: Request) {
  try {
    return handler(request)
  } catch (error: any) {
    console.error('[NextAuth] POST Error:', error)
    return new Response(
      JSON.stringify({ error: 'Authentication service error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}