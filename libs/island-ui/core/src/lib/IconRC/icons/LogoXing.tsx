import * as React from 'react'
import { SvgProps as SVGRProps } from '../Icon'

const SvgLogoXing = ({
  title,
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) => {
  return (
    <svg
      className="logo-xing_svg__ionicon"
      viewBox="0 0 512 512"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path d="M313.8 303.9L469 32H365L209.4 303.8a1.35 1.35 0 000 1.7l98.9 173.8c.4.7.8.7 1.6.7H413l-99.3-174.7a1.74 1.74 0 01.1-1.4zm-91.9-87.7L163 113a2 2 0 00-2-1H65l58.9 104.4a1.13 1.13 0 01.1.8L43 352h96.8a1.54 1.54 0 001.6-.9l80.5-133.7a2.44 2.44 0 000-1.2z" />
    </svg>
  )
}

export default SvgLogoXing
