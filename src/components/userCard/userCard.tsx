//styles
import { FC } from 'react';
import './userCard.scss'
import Button from '../general/button/button';

type userCardType = {
  id: number
  name: string, 
  email: string, 
  status: string,
}

const UserCard: FC<userCardType> = ({id, name, email, status}) => {
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
                        status === 'user' ? 'User':
                        status === 'admin' ? 'Admin':
                        status === 'superAdmin' ? 'Super Admin': null
                    }
                </div>
            </div>
            <div className="user-card-action-container">
                {
                    status === 'user' ?
                        <>
                            <Button text='Give admin access' onClick={()=>{console.log('+')}}/>
                            <Button text='Give super admin access' onClick={()=>{console.log('+')}}/>
                        </> : 
                    status === 'admin' ?
                        <>
                            <Button text='Delete admin access' onClick={()=>{console.log('+')}}/>
                            <Button text='Give super admin access' onClick={()=>{console.log('+')}}/>
                        </> : null
                }
            </div>
        </div>
    )
}

export default UserCard;
