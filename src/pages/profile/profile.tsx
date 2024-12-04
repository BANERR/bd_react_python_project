//react
import { useEffect, useState } from 'react';

//styles
import './profile.scss'

//components
import Header from '../../components/general/header/header';
import Input from '../../components/general/input/input';
import Button from '../../components/general/button/button';

type errors = {
    email?: string
    password?: string
    fullName?: string
}

const Profile = () => {
    const [fullName, setFullName] = useState('')
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
        if(fullName.length < 3){
            setErrors(prevErrors => ({...prevErrors, fullName: 'Enter correct full name'}))
            flag = false
        }else setErrors(prevErrors => ({...prevErrors, fullName: ''}))

        return flag
    }
    
    const handleSubmit = () => {
        checkErrors()
    }

    useState(()=>{
        setFullName('Artem Kurylenko')
        setEmail('artem@ri-software.com.ua')
        setPassword('example1431')
    })
  
    return (
        <div className="edit-wrapper">
            <Header/>
            <div className="edit-container">
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
                    type='text'
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    placeholder='Enter your password'
                    error={errors.password}
                />

                <div className="edit-action-container">
                    <Button text='Save' onClick={()=> handleSubmit()}/>
                </div>

            </div>
        </div>
    )
}

export default Profile;
