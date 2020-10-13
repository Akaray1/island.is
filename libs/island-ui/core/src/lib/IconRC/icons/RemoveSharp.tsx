import * as React from 'react'
import { SvgProps as SVGRProps } from '../Icon'

const SvgRemoveSharp = ({
  title,
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) => {
  return (
    <svg
      className="remove-sharp_svg__ionicon"
      viewBox="0 0 512 512"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="square"
        strokeLinejoin="round"
        strokeWidth={32}
        d="M400 256H112"
      />
    </svg>
  )
}

export default SvgRemoveSharp
