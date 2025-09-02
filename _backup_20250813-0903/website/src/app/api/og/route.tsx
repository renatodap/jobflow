import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(135deg, #0D0D0D 0%, #1A1A1A 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: '#1479FF',
            marginBottom: 20,
            letterSpacing: '-0.05em',
          }}
        >
          Sharpened
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            background: 'linear-gradient(90deg, #1479FF 0%, #00D0FF 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            textAlign: 'center',
            lineHeight: 1.1,
            maxWidth: 900,
            letterSpacing: '-0.03em',
          }}
        >
          Your edge, sharpened by AI
        </div>
        <div
          style={{
            fontSize: 24,
            color: '#a1a1aa',
            marginTop: 30,
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          AI-powered systems for learning, improvement, and achievement
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}