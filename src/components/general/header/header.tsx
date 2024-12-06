//react
import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react';

//styles
import './header.scss'

const Header = () => {
  const [pages, setPages] = useState<{link: string, page: string}[]>([])
  const [userName, setUserName] = useState('')
  const [status] = useState<string>('superAdmin')
  const [userId, setUserId] = useState(0)
  const [loginned] = useState(true)

  const location = useLocation();
  
  useEffect(()=>{
    if(status === 'user'){
      setPages([{link: '/', page: 'View Information'}])
    }else if(status === 'admin'){
      setPages([{link: '/', page: 'View Information'}, {link: '/saved-information', page: 'Saved Information'}, {link: '/add-information', page: 'Add Information'}])
    }else if (status === 'superAdmin'){
      setPages([{link: '/', page: 'View Information'}, {link: '/saved-information', page: 'Saved Information'}, {link: '/add-information', page: 'Add Information'}, {link: '/user-management', page: 'User Management'}])
    }

    setUserName('Artem')
  },[status])

  useEffect(()=>{
    setUserId(1)
    setUserName('Artem Kurylenko')
  },[])
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
            <Link className={`header-page ${location.pathname === '/profile' ? 'active' : ''}`} to={`/profile/${userId}`}>{userName}</Link>
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
