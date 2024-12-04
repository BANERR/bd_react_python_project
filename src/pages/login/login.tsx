//react
import { useEffect, useState } from 'react';

//styles
import './login.scss'

//components
import Header from '../../components/general/header/header';
import Input from '../../components/general/input/input';
import Button from '../../components/general/button/button';

type errors = {
    email?: string
    password?: string
}

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setrememberMe] = useState(false)
    const [errors, setErrors] = useState<errors>({email: '', password: ''})

    const checkErrors = () => {
        setErrors({email: '', password: ''})
        let flag = true
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if(!emailRegex.test(email)){
			setErrors(prevErrors => ({...prevErrors, email: 'Enter correct email'}))
			flag = false
		}else setErrors(prevErrors => ({...prevErrors, email: ''}))
        if(password.length < 8){
            setErrors(prevErrors => ({...prevErrors, password: 'Enter correct password'}))
            flag = false
        }else setErrors(prevErrors => ({...prevErrors, password: ''}))

        return flag
    }
    
    const handleSubmit = () => {
        checkErrors()
    }
  
    return (
        <div className="login-wrapper">
            <Header/>
            <div className="login-container">
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

                <div className="login-action-container">
                    <Button text='Login' onClick={()=> handleSubmit()}/>
                    <div className="login-action-remember-me">
                        <div className="login-action-remember-me-text">Remember me</div>
                        <input 
                            type="checkbox" 
                            className='remember-me-checkbox' 
                            checked={rememberMe}
                            onChange={()=>setrememberMe(!rememberMe)}
                        />
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Login;
