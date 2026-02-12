import { NextResponse } from 'next/server'

const RETELL_API_KEY = process.env.RETELL_API_KEY
const RETELL_AGENT_ID = 'agent_0e06c1041184c4ce36071cee57' // Demo agent

export async function POST() {
  try {
    if (!RETELL_API_KEY) {
      return NextResponse.json(
        { error: 'Retell API key not configured' },
        { status: 500 }
      )
    }

    // Create a web call using Retell API
    const response = await fetch('https://api.retellai.com/v2/create-web-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: RETELL_AGENT_ID,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Retell API error:', error)
      return NextResponse.json(
        { error: 'Failed to create web call' },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      access_token: data.access_token,
      call_id: data.call_id,
    })
  } catch (error) {
    console.error('Web call error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
