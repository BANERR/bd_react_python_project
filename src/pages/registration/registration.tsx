//react
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

//styles
import './registration.scss'

//components
import Header from '../../components/general/header/header'
import Input from '../../components/general/input/input'
import Button from '../../components/general/button/button'

type errors = {
    email?: string
    password?: string
    fullName?: string
}

const Registration = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [errors, setErrors] = useState<errors>({email: '', password: '', fullName: ''})

    const navigate = useNavigate()

    const checkErrors = () => {
        setErrors({email: '', password: ''})
        let flag = true
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

		if (!emailRegex.test(email)) {
			setErrors(prevErrors => ({...prevErrors, email: 'Enter correct email'}))
			flag = false
		} else setErrors(prevErrors => ({...prevErrors, email: ''}))
        if (password.length < 8) {
            setErrors(prevErrors => ({...prevErrors, password: 'Enter correct password'}))
            flag = false
        } else setErrors(prevErrors => ({...prevErrors, password: ''}))
        if (fullName.length < 3) {
            setErrors(prevErrors => ({...prevErrors, fullName: 'Enter correct full name'}))
            flag = false
        } else setErrors(prevErrors => ({...prevErrors, fullName: ''}))

        return flag
    }
    
    const handleSubmit = () => {
        if (!checkErrors()) return

        try {
            fetch('http://localhost:5000/api/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    full_name: fullName,
                    email: email,
                    password: password,
                })
            })
            .then((response)=>{
                if (response.ok) {
                    navigate('/login')
                } else {
                    alert('An error occurred')
                }
            })
        } catch (error) {
            console.error('Error:', error)
            alert('An error occurred during registration')
        }
    }
  
    return (
        <div className="registration-wrapper">
            <Header/>
            <div className="registration-container">
                <Input
                    type='text'
                    value={fullName}
                    onChange={(e)=>setFullName(e.target.value)}
                    placeholder='Enter your full name'
                    error={errors.fullName}
                />

                <Input
                    type='email'
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    placeholder='Enter your email'
                    error={errors.email}
                />
                <Input
                    type='password'
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    placeholder='Enter your password'
                    error={errors.password}
                />

                <div className="registration-action-container">
                    <Button text='Create account' onClick={()=> handleSubmit()}/>
                </div>

            </div>
        </div>
    )
}

export default Registration
