import React from 'react'
import cn from 'classnames'

import { Text } from '../Text/Text'
import { Tooltip } from '../Tooltip/Tooltip'
import * as styles from './RadioButton.css'
import { InputBackgroundColor } from '../Input/types'
import { Box } from '../Box/Box'
import { BoxProps } from '../Box/types'
import { Tag } from '../Tag/Tag'
import { TagVariant } from '../Tag/types'
import { TestSupport } from '@island.is/island-ui/utils'
import { Hidden } from '../Hidden/Hidden'

export interface RadioButtonProps {
  name?: string
  id?: string
  label?: React.ReactNode
  value?: string | number
  checked?: boolean
  disabled?: boolean
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  tooltip?: React.ReactNode
  
  tag?: {
    label: string
    variant?: TagVariant
    outlined?: boolean
  }
  hasError?: boolean
  errorMessage?: string
  large?: boolean
  /** backgroundColor can only be used if the 'large' prop set to true */
  backgroundColor?: InputBackgroundColor
  /** subLabel can only be used if the 'large' prop set to true */
  subLabel?: React.ReactNode
  /** illustration can only be used if the 'large' prop set to true */
  illustration?: React.FC<React.PropsWithChildren<unknown>>
  signature?: string
  imageSrc?: string
  vertical?: boolean
  license?: boolean
}

interface AriaError {
  'aria-invalid': boolean
  'aria-describedby': string
}

const backgroundColors: Record<InputBackgroundColor, BoxProps['background']> = {
  white: 'white',
  blue: 'blue100',
}
export const RadioButton = ({
  label,
  subLabel,
  name,
  id = name,
  value,
  checked,
  disabled,
  onChange,
  tooltip,
  tag,
  illustration: Illustration,
  hasError,
  errorMessage,
  large,
  dataTestId,
  backgroundColor,
  imageSrc,
  signature,
  vertical,
  license,
}: RadioButtonProps & TestSupport) => {
  console.log(imageSrc, signature)
  const errorId = `${id}-error`
  const ariaError = hasError
    ? {
        'aria-invalid': true,
        'aria-describedby': errorId,
      }
    : {}

  return (
    <Box
      className={cn(styles.container, {
        [styles.large]: large,
        [styles.largeError]: large && hasError,
        [styles.verticalContainer]: vertical,
      })}
      background={
        large && backgroundColor ? backgroundColors[backgroundColor] : undefined
      }
    >
      <input
        className={styles.input}
        type="radio"
        name={name}
        disabled={disabled}
        id={id}
        data-testid={dataTestId}
        onChange={onChange}
        value={value}
        checked={checked}
        {...(ariaError as AriaError)}
      />
      <label
        className={cn(styles.label, {
          [styles.radioButtonLabelDisabled]: disabled,
          [styles.largeLabel]: large,
          [styles.verticalLabel]: vertical,
        })}
        htmlFor={id}
      >
        {imageSrc && 
         <Box
          className={styles.imageContainer}
       >
            <img
            src={imageSrc}
            alt="image"
            className={styles.image}
          />
        </Box>
       }
        {signature && 
         <Box
          className={styles.imageContainer}
       >
          <img
            src={signature}
            alt="image"
          />
        </Box>
       }
        <div
          className={cn(styles.radioButton, {
            [styles.radioButtonChecked]: checked,
            [styles.radioButtonError]: hasError,
            [styles.radioButtonDisabled]: disabled,
            [styles.licenseCheckmark]: license
          })}
        >
          <div className={cn(styles.checkMark)} />
        </div>
        <span className={cn(styles.labelText, {
          [styles.licenseText]: license,
        })}>
          <Text as="span" fontWeight={checked ? 'semiBold' : 'light'}>
            {label}
          </Text>
          {subLabel && large && (
            <Text
              as="span"
              marginTop="smallGutter"
              fontWeight="regular"
              variant="small"
            >
              {subLabel}
            </Text>
          )}
        </span>
        {large && Illustration && (
          <Box marginLeft="auto" paddingRight="smallGutter">
            <Illustration />
          </Box>
        )}
        {tooltip && (
          <div
            className={cn(styles.tooltipContainer, {
              [styles.tooltipLargeContainer]: large && !Illustration,
              [styles.toolTipLargeContainerWithIllustration]:
                large && Illustration,
            })}
          >
            <Tooltip text={tooltip} />
          </div>
        )}
        <Hidden below="sm">
          {tag && large && (
            <Tag outlined={tag.outlined} variant={tag.variant} disabled>
              {tag.label}
            </Tag>
          )}
        </Hidden>
      </label>
      <Hidden above="xs">
        {tag && large && (
          <Box paddingLeft="gutter" paddingBottom="gutter">
            <Tag outlined={tag.outlined} variant={tag.variant} disabled>
              {tag.label}
            </Tag>
          </Box>
        )}
      </Hidden>
      {hasError && errorMessage && (
        <div id={errorId} className={styles.errorMessage} aria-live="assertive">
          {errorMessage}
        </div>
      )}
    </Box>
  )
}
