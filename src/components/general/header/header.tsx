//react
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react';

//styles
import './header.scss'
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { setUserData } from '../../../redux/slicers/userSlice';

const Header = () => {

  const user = useSelector((state: RootState) => state.user.userData);
  const [pages, setPages] = useState<{link: string, page: string}[]>([])
  const [fullName, setFullName] = useState(user.fullName)
  const [loginned, setLoginned] = useState(user.loginned)


  const location = useLocation();
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  useEffect(()=>{
    setFullName(user.fullName)
    setLoginned(user.loginned)

    if(user.status === 'user' && user.loginned == false){
      setPages([{link: '/', page: 'View Information'}])
    }else if(user.status === 'user' && user.loginned == true){
      setPages([{link: '/', page: 'View Information'}, {link: '/saved-information', page: 'Saved Information'}])
    }else if(user.status === 'admin'){
      setPages([{link: '/', page: 'View Information'}, {link: '/saved-information', page: 'Saved Information'}, {link: '/add-information', page: 'Add Information'}])
    }else if (user.status === 'superAdmin'){
      setPages([{link: '/', page: 'View Information'}, {link: '/saved-information', page: 'Saved Information'}, {link: '/add-information', page: 'Add Information'}, {link: '/user-management', page: 'User Management'}])
    }
  },[user])
  

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const authToken = localStorage.getItem('authToken');

    if (authToken && userData && Date.now() < userData.tokenExpiration) {
        dispatch(setUserData(userData));
    } else {
        localStorage.clear();
        dispatch(setUserData({
          id: 0,
          fullName: '',
          loginned: false,
          status: 'user',
          email: '',
          savedInformation: [0]
        })); // Очищаем localStorage, если токен просрочен
    }
  }, [dispatch, navigate]);

  
  return (
    <div className="header-wrapper">
      <div className="header-pages-container">
        {
          pages.map((page)=>{return <Link className={`header-page ${location.pathname === page.link ? 'active' : ''}`} to={page.link}>{page.page}</Link>})
        }
      </div>
      <div className="header-authorization-container">
        {
          loginned ?
            <Link className={`header-page ${location.pathname === '/profile' ? 'active' : ''}`} to={`/profile/${user.id}`}>{fullName}</Link>
            : 
              <>
                <Link className={`header-page ${location.pathname === '/login' ? 'active' : ''}`} to={'/login'}>Login</Link>
                <Link className={`header-page ${location.pathname === '/registration' ? 'active' : ''}`} to={'/registration'}>Registration</Link>
              </>
        }
      </div>
    </div>
  )
}

export default Header;
