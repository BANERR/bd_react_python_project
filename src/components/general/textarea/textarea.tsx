import { FC } from 'react'
import './textarea.scss'

type textareaProps = {
    value: string
    placeholder: string
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    error?: string
}

const Textarea: FC<textareaProps> = ({value, placeholder, onChange, error}) => {


    return (
        <div className="textarea-wrapper">
            <textarea className={error? 'textarea-error textarea': 'textarea'}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
            {
                error?
                    <div className="textarea-error-text">{error}</div>
                    : null
            }
        </div>
    )
}

export default Textarea