//styles
import './button.scss'

//react
import { FC } from 'react'


type buttonProps = {
    text: string
    active?: boolean
    onClick: () => void
}

const Button: FC<buttonProps> = ({ text, active, onClick }) => {
	return (
		<button className={`button ${active ? 'button-active' : ''}`} onClick={onClick}>
			{text}
		</button>
	)
}

export default Button