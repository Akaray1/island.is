import * as React from 'react'
import { SvgProps as SVGRProps } from '../Icon'

const SvgStopwatchSharp = ({
  title,
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) => {
  return (
    <svg
      className="stopwatch-sharp_svg__ionicon"
      viewBox="0 0 512 512"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path d="M280 81.5V48h-48v33.5a191 191 0 00-84.43 32.13L120 86l-34 34 25.59 25.59A191.17 191.17 0 0064 272c0 105.87 86.13 192 192 192s192-86.13 192-192c0-97.74-73.42-178.66-168-190.5zM256 320a48 48 0 01-16-93.25V136h32v90.75A48 48 0 01256 320z" />
    </svg>
  )
}

export default SvgStopwatchSharp
