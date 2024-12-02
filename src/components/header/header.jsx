//react
import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react';

//styles
import './header.scss'

const Header = ({children}) => {
  const [pages, setPages] = useState([])
  const [userName, setUserName] = useState('')
  const [status] = useState('superAdmin')

  const location = useLocation();
  
  useEffect(()=>{
    if(status === 'user'){
      setPages([{link: '/', page: 'View Information'}])
    }else if(status === 'admin'){
      setPages([{link: '/', page: 'View Information'}, {link: '/saved-information', page: 'Saved Information'}, {link: '/add-information', page: 'Add Information'}])
    }else if (status === 'superAdmin'){
      setPages([{link: '/', page: 'View Information'}, {link: '/saved-information', page: 'Saved Information'}, {link: '/add-information', page: 'Add Information'}, {link: '/admins', page: 'Admins'}])
    }

    setUserName('Artem')
  },[status])
  return (
    <div className="header-wrapper">
      <div className="header-pages-container">
        {
          pages.map((page)=>{return <Link className={`header-page ${location.pathname === page.link ? 'active' : ''}`} to={page.link}>{page.page}</Link>})
        }
      </div>
      <div className="header-authorization">
        {
          status.loginned ?
            <Link className={`header-page ${location.pathname === '/profile' ? 'active' : ''}`} to={'/profile'}>{userName}</Link>
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
