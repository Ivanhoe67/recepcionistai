/**
 * Evolution API Client
 * Handles WhatsApp messaging via Evolution API
 */

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || ''
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || ''
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || ''

interface SendTextOptions {
  to: string
  text: string
  instance?: string
}

interface SendAudioOptions {
  to: string
  audioUrl: string
  instance?: string
}

export async function sendWhatsAppText({ to, text, instance }: SendTextOptions): Promise<boolean> {
  const instanceName = instance || EVOLUTION_INSTANCE

  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !instanceName) {
    console.error('Evolution API not configured')
    return false
  }

  try {
    // Format phone number (remove @ suffix if present)
    const phone = to.includes('@') ? to.split('@')[0] : to
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`

    const response = await fetch(
      `${EVOLUTION_API_URL}/message/sendText/${encodeURIComponent(instanceName)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY
        },
        body: JSON.stringify({
          number: formattedPhone,
          text: text
        })
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Evolution API error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error)
    return false
  }
}

export async function sendWhatsAppAudio({ to, audioUrl, instance }: SendAudioOptions): Promise<boolean> {
  const instanceName = instance || EVOLUTION_INSTANCE

  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !instanceName) {
    console.error('Evolution API not configured')
    return false
  }

  try {
    const phone = to.includes('@') ? to.split('@')[0] : to
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`

    const response = await fetch(
      `${EVOLUTION_API_URL}/message/sendWhatsAppAudio/${encodeURIComponent(instanceName)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY
        },
        body: JSON.stringify({
          number: formattedPhone,
          audio: audioUrl
        })
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Evolution API audio error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to send WhatsApp audio:', error)
    return false
  }
}

/**
 * Transcribe audio from base64 using OpenAI Whisper
 */
export async function transcribeAudio(base64Audio: string, mimeType: string): Promise<string | null> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY

  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not configured')
    return null
  }

  try {
    // Convert base64 to buffer
    const audioBuffer = Buffer.from(base64Audio, 'base64')

    // Create form data
    const formData = new FormData()
    const blob = new Blob([audioBuffer], { type: mimeType || 'audio/ogg' })
    formData.append('file', blob, 'audio.ogg')
    formData.append('model', 'whisper-1')
    formData.append('language', 'es')

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: formData
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI Whisper error:', error)
      return null
    }

    const result = await response.json()
    return result.text
  } catch (error) {
    console.error('Failed to transcribe audio:', error)
    return null
  }
}
