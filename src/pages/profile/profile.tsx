//react
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom' 

// styles
import './profile.scss'

//redux
import { RootState } from '../../redux/store'
import { setUserData } from '../../redux/slicers/userSlice'
import { useDispatch, useSelector } from 'react-redux'

// components
import Header from '../../components/general/header/header'
import Input from '../../components/general/input/input'
import Button from '../../components/general/button/button'


type errors = {
    email?: string
    password?: string
    fullName?: string
}

const Profile = () => {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState<errors>({ email: '', password: '', fullName: '' })

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const user = useSelector((state: RootState) => state.user.userData)

    const checkErrors = () => {
        setErrors({ email: '', password: '', fullName: '' })
        let flag = true
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!emailRegex.test(email)) {
            setErrors(prevErrors => ({ ...prevErrors, email: 'Enter a valid email' }))
            flag = false
        }

        if (password.length < 8) {
            setErrors(prevErrors => ({ ...prevErrors, password: 'Password must be at least 8 characters' }))
            flag = false
        }

        if (fullName.length < 3) {
            setErrors(prevErrors => ({ ...prevErrors, fullName: 'Full name must be at least 3 characters' }))
            flag = false
        }

        return flag
    }

    const handleSubmit = async () => {
        if (checkErrors()) {
            try {
                const response = await fetch(`http://localhost:5000/api/user/update`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    },
                    body: JSON.stringify({ 
                        user_id: user.id,
                        full_name: fullName, 
                        email: email, 
                        password: password
                    }),
                })

                if (response.ok) {
                    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
                    userData.fullName = fullName
                    userData.email = email
                    userData.password = password
                    localStorage.setItem('userData', JSON.stringify(userData))
                    dispatch(setUserData(userData))
                    
                } else {
                    console.error('Error updating profile')
                }
            } catch (error) {
                console.error('Error updating profile:', error)
            }
        }
    }

    const logout = () => {
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
        navigate('/login')
    }

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}')
        if (userData) {
            setFullName(userData.fullName)
            setEmail(userData.email)
            setPassword(userData.password)
        }
    }, [])

    return (
        <div className="edit-wrapper">
            <Header />
            <div className="edit-container">
                <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    error={errors.fullName}
                />
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

                <div className="edit-action-container">
                    <Button text="Save" onClick={handleSubmit} />
                </div>

                <div className="edit-action-container">
                    <Button text="Log out" onClick={logout} />
                </div>
            </div>
        </div>
    )
}

export default Profile
