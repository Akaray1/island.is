import * as React from 'react'
import { SvgProps as SVGRProps } from '../Icon'

const SvgSnowOutline = ({
  title,
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) => {
  return (
    <svg
      className="snow-outline_svg__ionicon"
      viewBox="0 0 512 512"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={32}
        d="M256 32v448m57.72-400A111.47 111.47 0 01256 96a111.47 111.47 0 01-57.72-16m0 352a112.11 112.11 0 01115.44 0m136.27-288L62.01 368m375.26-150a112.09 112.09 0 01-57.71-100M74.73 294a112.09 112.09 0 0157.71 100M62.01 144l387.98 224M74.73 218a112.09 112.09 0 0057.71-100m304.83 176a112.09 112.09 0 00-57.71 100"
      />
    </svg>
  )
}

export default SvgSnowOutline
