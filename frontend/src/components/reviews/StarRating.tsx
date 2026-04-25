import React, { useState } from 'react'

interface StarRatingProps {
  value: number
  onChange: (value: number) => void
  label: string
  readOnly?: boolean
}

// Renders a single star SVG, supporting full, half, or empty fill states
const Star: React.FC<{
  fill: 'full' | 'half' | 'empty'
  size?: number
}> = ({ fill, size = 22 }) => {
  const id = React.useId()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {fill === 'half' && (
        <defs>
          <linearGradient id={id}>
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      )}
      <polygon
        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
        fill={
          fill === 'full'
            ? '#eab308'
            : fill === 'half'
            ? `url(#${id})`
            : 'transparent'
        }
        stroke={fill === 'empty' ? '#374151' : '#eab308'}
        strokeWidth={fill === 'empty' ? 1.5 : 0}
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  label,
  readOnly = false,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const displayed = hoverValue !== null ? hoverValue : value

  // Given an SVG container event, compute the star value (0.5 increments)
  const computeValue = (
    e: React.MouseEvent<HTMLSpanElement>,
    starIndex: number
  ): number => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const isHalf = x < rect.width / 2
    return isHalf ? starIndex - 0.5 : starIndex
  }

  const getFill = (starIndex: number): 'full' | 'half' | 'empty' => {
    if (displayed >= starIndex) return 'full'
    if (displayed >= starIndex - 0.5) return 'half'
    return 'empty'
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-0.5 ${!readOnly ? 'cursor-pointer' : ''}`}
          onMouseLeave={() => !readOnly && setHoverValue(null)}
          role={readOnly ? undefined : 'slider'}
          aria-label={label}
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={5}
          aria-valuetext={`${value} out of 5`}
        >
          {[1, 2, 3, 4, 5].map((starIndex) => (
            <span
              key={starIndex}
              onMouseMove={
                !readOnly
                  ? (e) => setHoverValue(computeValue(e, starIndex))
                  : undefined
              }
              onClick={
                !readOnly
                  ? (e) => onChange(computeValue(e, starIndex))
                  : undefined
              }
              className={!readOnly ? 'select-none' : ''}
              style={{ display: 'inline-flex' }}
            >
              <Star fill={getFill(starIndex)} />
            </span>
          ))}
        </div>
        <span className="min-w-[2.5rem] text-sm font-black text-yellow-400">
          {displayed > 0 ? displayed.toFixed(1) : '—'}
        </span>
      </div>
    </div>
  )
}
