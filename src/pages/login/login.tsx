import { useState, useEffect } from 'react';
import './login.scss';
import Header from '../../components/general/header/header';
import Input from '../../components/general/input/input';
import Button from '../../components/general/button/button';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUserData } from '../../redux/slicers/userSlice';

type Errors = {
    email?: string;
    password?: string;
};

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState<Errors>({});

    const navigate = useNavigate()
    const dispatch = useDispatch()

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const authToken = localStorage.getItem('authToken');
        
        // Проверка срока действия токена
        if (authToken && userData) {
            const tokenExpiration = userData.tokenExpiration;
            if (Date.now() < tokenExpiration) {
                dispatch(setUserData(userData));
                navigate('/');
            } else {
                localStorage.clear(); // Очищаем данные, если токен просрочен
            }
        }
    }, [dispatch, navigate]);
    
    const handleSubmit = async () => {
        if (!checkErrors()) return;
    
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
            });
    
            if (response.ok) {
                const data = await response.json();
    
                // Устанавливаем токен и данные в localStorage
                const tokenExpiration = Date.now() + 3600 * 1000; // Токен действителен 1 день
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userData', JSON.stringify({
                    id: data.user.id,
                    fullName: data.user.full_name,
                    email: data.user.email,
                    status: data.user.status,
                    loginned: true,
                    password: data.user.password,
                    tokenExpiration, // Сохраняем время истечения токена
                }));
    
                // Устанавливаем данные пользователя в Redux
                dispatch(setUserData(data.user));
                navigate('/');
            } else {
                alert('Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred during login.');
        }
    };
    
    

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
    );
};

export default Login;
