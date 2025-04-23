import InputMask from 'react-input-mask'
import { Input } from "@/components/ui/input"

const MaskedInput = ({ mask, ...props }) => (
    <InputMask mask={mask} {...props}>
        {(inputProps) => <Input {...inputProps} />}
    </InputMask>
)