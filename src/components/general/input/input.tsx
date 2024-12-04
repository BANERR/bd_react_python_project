import { FC } from 'react'
import './input.scss'

type inputProps = {
    type: string
    value: string
    placeholder: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    disabled?: boolean
    error?: string
}


const Input:FC<inputProps> = ({type, value, placeholder, onChange, disabled, error}) => {


    return (
        <div className="input-wrapper">
            <input className={error? 'input input-error': 'input'}
                type={type}
                value={value}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
                autoComplete="off"
            />
            {
                error?
                    <div className="input-error-text">{error}</div>
                    : null
            }
        </div>
    )
}

export default Input