import * as React from 'react'
import { SvgProps as SVGRProps } from '../Icon'

const SvgHeartHalfSharp = ({
  title,
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) => {
  return (
    <svg
      className="heart-half-sharp_svg__ionicon"
      viewBox="0 0 512 512"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path d="M352.92 64c-48.11 0-80.1 28-96.92 48.21C239.18 92 207.19 64 159.08 64 98.46 64 48.63 114.54 48 176.65c-.56 55.68 19.71 107 62 157 40.12 47.46 94.25 79.75 137 108.32l9 6 9-6c42.78-28.57 96.91-60.86 137-108.32 42.25-50 62.52-101.35 62-157C463.37 114.54 413.54 64 352.92 64zm24.67 249c-31.78 37.6-74.68 65.75-112.52 90.59l-9.07 6V162.23l24.59-29.54C294.53 116 318.38 96 352.92 96c43.15 0 78.62 36.32 79.07 81a178.63 178.63 0 01-12.69 68.59c-9.03 22.84-22.67 44.91-41.71 67.41z" />
    </svg>
  )
}

export default SvgHeartHalfSharp
