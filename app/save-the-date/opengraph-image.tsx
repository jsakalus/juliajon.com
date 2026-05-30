import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export const alt = 'Save the Date — The Wedding of Julia & Jonathan, May 29, 2027'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  const serif = readFileSync(join(process.cwd(), 'public/fonts/PlayfairDisplay-900.ttf'))
  const serifItalic = readFileSync(join(process.cwd(), 'public/fonts/PlayfairDisplay-700-Italic.ttf'))

  return new ImageResponse(
    (
      <div
        style={{
          background: '#F8F4EC',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Sage accent bars */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, background: '#578C6C' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 10, background: '#578C6C' }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* save the */}
          <span
            style={{
              fontFamily: 'Playfair Display',
              fontSize: 92,
              fontWeight: 700,
              fontStyle: 'italic',
              color: '#2C2018',
              lineHeight: 1.05,
            }}
          >
            save the
          </span>

          {/* DATE! */}
          <span
            style={{
              fontFamily: 'Playfair Display',
              fontSize: 156,
              fontWeight: 900,
              color: '#2C2018',
              lineHeight: 0.95,
              marginBottom: 36,
            }}
          >
            DATE!
          </span>

          {/* — for — divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ width: 72, height: 1, background: '#578C6C' }} />
            <span
              style={{
                fontFamily: 'Playfair Display',
                fontSize: 18,
                fontWeight: 700,
                fontStyle: 'italic',
                color: '#578C6C',
                letterSpacing: '0.15em',
              }}
            >
              for
            </span>
            <div style={{ width: 72, height: 1, background: '#578C6C' }} />
          </div>

          {/* The Wedding of... */}
          <span
            style={{
              fontFamily: 'Playfair Display',
              fontSize: 36,
              fontWeight: 700,
              fontStyle: 'italic',
              color: '#2C2018',
              marginBottom: 10,
            }}
          >
            The Wedding of Julia & Jonathan
          </span>

          {/* Date & location */}
          <span
            style={{
              fontFamily: 'Playfair Display',
              fontSize: 17,
              fontWeight: 700,
              fontStyle: 'italic',
              color: '#6B5848',
              letterSpacing: '0.18em',
            }}
          >
            MAY 29, 2027 · CANMORE, ALBERTA
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Playfair Display', data: serif, weight: 900, style: 'normal' },
        { name: 'Playfair Display', data: serifItalic, weight: 700, style: 'italic' },
      ],
    }
  )
}
