import * as React from 'react'
import { SvgProps as SVGRProps } from '../Icon'

const SvgHardwareChip = ({
  title,
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) => {
  return (
    <svg
      className="hardware-chip_svg__ionicon"
      viewBox="0 0 512 512"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        d="M352 128H160a32 32 0 00-32 32v192a32 32 0 0032 32h192a32 32 0 0032-32V160a32 32 0 00-32-32zm0 216a8 8 0 01-8 8H168a8 8 0 01-8-8V168a8 8 0 018-8h176a8 8 0 018 8z"
        fill="none"
      />
      <rect x={160} y={160} width={192} height={192} rx={8} ry={8} />
      <path d="M464 192a16 16 0 000-32h-16v-32a64.07 64.07 0 00-64-64h-32V48a16 16 0 00-32 0v16h-48V48a16 16 0 00-32 0v16h-48V48a16 16 0 00-32 0v16h-32a64.07 64.07 0 00-64 64v32H48a16 16 0 000 32h16v48H48a16 16 0 000 32h16v48H48a16 16 0 000 32h16v32a64.07 64.07 0 0064 64h32v16a16 16 0 0032 0v-16h48v16a16 16 0 0032 0v-16h48v16a16 16 0 0032 0v-16h32a64.07 64.07 0 0064-64v-32h16a16 16 0 000-32h-16v-48h16a16 16 0 000-32h-16v-48zm-80 160a32 32 0 01-32 32H160a32 32 0 01-32-32V160a32 32 0 0132-32h192a32 32 0 0132 32z" />
    </svg>
  )
}

export default SvgHardwareChip
