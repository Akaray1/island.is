import * as React from 'react'
import { SvgProps as SVGRProps } from '../Icon'

const SvgUnlink = ({
  title,
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) => {
  return (
    <svg
      className="unlink_svg__ionicon"
      viewBox="0 0 512 512"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        d="M200.66 352H144a96 96 0 010-192h55.41m113.18 0H368a96 96 0 010 192h-56.66"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={48}
      />
    </svg>
  )
}

export default SvgUnlink
