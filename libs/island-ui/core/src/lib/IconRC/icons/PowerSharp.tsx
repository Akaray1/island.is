import * as React from 'react'
import { SvgProps as SVGRProps } from '../Icon'

const SvgPowerSharp = ({
  title,
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) => {
  return (
    <svg
      className="power-sharp_svg__ionicon"
      viewBox="0 0 512 512"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path d="M256 464c-114.69 0-208-93.23-208-207.82a207.44 207.44 0 0174.76-160.13l16.9-14 28.17 33.72-16.9 14A163.72 163.72 0 0092 256.18c0 90.39 73.57 163.93 164 163.93s164-73.54 164-163.93a163.38 163.38 0 00-59.83-126.36l-17-14 28-33.82 17 14A207.13 207.13 0 01464 256.18C464 370.77 370.69 464 256 464z" />
      <path d="M234 48h44v224h-44z" />
    </svg>
  )
}

export default SvgPowerSharp
