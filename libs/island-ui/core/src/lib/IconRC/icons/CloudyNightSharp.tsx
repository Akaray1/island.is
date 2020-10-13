import * as React from 'react'
import { SvgProps as SVGRProps } from '../Icon'

const SvgCloudyNightSharp = ({
  title,
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) => {
  return (
    <svg
      className="cloudy-night-sharp_svg__ionicon"
      viewBox="0 0 512 512"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path d="M340 480H106c-29.5 0-54.92-7.83-73.53-22.64C11.23 440.44 0 415.35 0 384.8c0-29.44 12.09-54.25 35-71.74 14.55-11.13 33.41-18.87 53.2-22 6.06-36.92 21.92-68.53 46.29-92A139.82 139.82 0 01232 160c32.33 0 62.15 10.65 86.24 30.79a142.41 142.41 0 0140.83 57.05c27.18 4.48 51.59 15.68 69.56 32.08C451.77 301 464 329.82 464 363.2c0 32.85-13.13 62.87-37 84.52-22.89 20.82-53.8 32.28-87 32.28zm41.55-260.07c26.5 6.93 50 19.32 68.65 36.34q3.89 3.56 7.47 7.34c25.41-18.4 45.47-44.92 54.33-71.38-16.24 7.07-35.31 9.85-54.15 9.85-73.42 0-115.93-42.51-115.93-115.93 0-18.84 2.78-37.91 9.85-54.15-40.41 13.53-81 53.19-92.52 98.13a162.61 162.61 0 0179.52 36.12 173 173 0 0142.78 53.68z" />
    </svg>
  )
}

export default SvgCloudyNightSharp
