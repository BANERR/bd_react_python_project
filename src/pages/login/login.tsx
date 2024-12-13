//styles
import './login.scss'

//react
import { useState, useEffect } from 'react'

//redux
import { useDispatch } from 'react-redux'
import { setUserData } from '../../redux/slicers/userSlice'

//components
import Header from '../../components/general/header/header'
import Input from '../../components/general/input/input'
import Button from '../../components/general/button/button'

//other
import { useNavigate } from 'react-router-dom'


type Errors = {
    email?: string
    password?: string
}

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const [errors, setErrors] = useState<Errors>({})

    const navigate = useNavigate()
    const dispatch = useDispatch()

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}')
        const authToken = localStorage.getItem('authToken')
        
        if (authToken && userData) {
            const tokenExpiration = userData.tokenExpiration
            if (Date.now() < tokenExpiration) {
                dispatch(setUserData(userData))
                navigate('/')
            } else {
                localStorage.clear() 
            }
        }
    }, [dispatch, navigate])
    
    const handleSubmit = async () => {
        if (!checkErrors()) return
    
        try {
            const response = await fetch('http://localhost:5000/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            })
    
            if (response.ok) {
                const data = await response.json()
    
                const tokenExpiration = Date.now() + 3600 * 1000
                localStorage.setItem('authToken', data.token)
                localStorage.setItem('userData', JSON.stringify({
                    id: data.user.id,
                    fullName: data.user.full_name,
                    email: data.user.email,
                    status: data.user.status,
                    loginned: true,
                    password: data.user.password,
                    savedInformation: data.user.saved_information,
                    tokenExpiration, 
                }))
    
                dispatch(setUserData(data.user))
                navigate('/')
            } else {
                alert('Login failed. Please check your credentials.')
            }
        } catch (error) {
            console.error('Error during login:', error)
            alert('An error occurred during login.')
        }
    }
    
    

    const checkErrors = () => {
        setErrors({})
        let flag = true
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!emailRegex.test(email)) {
            setErrors((prevErrors) => ({ ...prevErrors, email: 'Enter correct email' }))
            flag = false
        }

        if (password.length < 8) {
            setErrors((prevErrors) => ({ ...prevErrors, password: 'Enter correct password' }))
            flag = false
        }

        return flag
    }

    return (
        <div className="login-wrapper">
            <Header />
            <div className="login-container">
                <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    error={errors.email}
                />
                <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    error={errors.password}
                />

                <div className="login-action-container">
                    <Button text="Login" onClick={() => handleSubmit()} />
                    <div className="login-action-remember-me">
                        <div className="login-action-remember-me-text">Remember me</div>
                        <input
                            type="checkbox"
                            className="remember-me-checkbox"
                            checked={rememberMe}
                            onChange={() => setRememberMe(!rememberMe)}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
