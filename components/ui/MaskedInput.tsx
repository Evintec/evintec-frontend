// components/ui/MaskedInput.tsx
import React from 'react'
import InputMask from 'react-input-mask'

const MaskedInput = React.forwardRef<HTMLInputElement, any>(
  ({ mask, ...props }, ref) => {
    return <InputMask mask={mask} {...props}>
      {(inputProps: any) => <input ref={ref} {...inputProps} />}
    </InputMask>
  }
)

MaskedInput.displayName = 'MaskedInput'

export default MaskedInput
