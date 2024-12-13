//styles
import './userCard.scss'

//react
import { FC, useState } from 'react'

//components
import Button from '../general/button/button'

type userCardType = {
  id: number
  name: string
  email: string
  status: string
}

const UserCard: FC<userCardType> = ({id, name, email, status}) => {
    const [userStatus, setUserStatus] = useState<string>(status)

    const handleStatusChange = async (newStatus: string) => {
        try {
            const response = await fetch('http://localhost:5000/api/user/promote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: id,
                    new_status: newStatus
                })
            })

            const data = await response.json()

            if (response.ok) {
                setUserStatus(newStatus)
            } else {
                console.error('Error:', data.error)
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }

    return (
        <div className="user-card-wrapper">
            <div className="user-card-name-container">
                <div className="user-card-name text">
                {name}
                </div>
            </div>
            <div className="user-card-email-container">
                <div className="user-card-email text">
                {email}
                </div>
            </div>
            <div className="user-card-status-container">
                <div className="user-card-status text">
                    {
                        userStatus === 'user' ? 'User':
                        userStatus === 'admin' ? 'Admin':
                        userStatus === 'superAdmin' ? 'Super Admin': null
                    }
                </div>
            </div>
            <div className="user-card-action-container">
                {
                    userStatus === 'user' ? 
                        <>
                            <Button text='Give admin access' onClick={() => handleStatusChange('admin')} />
                            <Button text='Give super admin access' onClick={() => handleStatusChange('superAdmin')} />
                        </> : 
                    userStatus === 'admin' ?
                        <>
                            <Button text='Delete admin access' onClick={() => handleStatusChange('user')} />
                            <Button text='Give super admin access' onClick={() => handleStatusChange('superAdmin')} />
                        </> : null
                }
            </div>
        </div>
    )
}

export default UserCard
