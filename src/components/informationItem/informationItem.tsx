//styles
import { FC, useState } from 'react';
import { edit, star, trash } from '../../assets/icon';
import './informationItem.scss'
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { setUserData } from '../../redux/slicers/userSlice';

type informationItemType = {
  id: number
  title: string, 
  text: string, 
  path: string[]
  
}

type informationItemProps = informationItemType & {
  informationList: informationItemType[]
  setInformationList: React.Dispatch<React.SetStateAction<informationItemType[]>>
}

const InformationItem: FC<informationItemProps> = ({ id, title, text, path, informationList, setInformationList }) => {
  const user = useSelector((state: RootState) => state.user.userData);
  const [userStatus, setUserStatus] = useState(user.status);
  const [userLoginned, setUserLoginned] = useState(user.loginned);
  const [saved, setSaved] = useState(user.savedInformation.includes(id))

  const navigate = useNavigate();
  const dispatch = useDispatch()


  const saveInformation = async () => {
    if (!userLoginned) return navigate('/login');
    try {
      setSaved(!saved)
      const response = await fetch('http://localhost:5000/api/information/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          information_id: id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        userData.savedInformation = data
        localStorage.setItem('userData', JSON.stringify(userData))
        dispatch(setUserData(userData))

      } else {
        console.error('Error');
      }
    } catch (error) {
      console.error('Error saving information:', error);
    }
  };

  const deleteInformation = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/information/delete/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (response.ok) {
        setInformationList(informationList.filter(item => item.id !== id));
      } else {
        alert(data.message || 'Failed to delete information.');
      }
    } catch (error) {
      console.error('Error deleting information:', error);
      alert('An error occurred while deleting information.');
    }
  };

  return (
    <div className="information-item-wrapper">
      <div className="information-item-title-container">
        <div className="information-item-title text">{title}</div>
      </div>
      <div className="information-item-text-container">
        <div className="information-item-text text">{text}</div>
      </div>
      <div className="information-item-files-container">
        {path.map((image) => (
          <div className="information-item-file text" key={image}>
            {image}
          </div>
        ))}
      </div>
      <div className="information-item-action-container">
        {userLoginned ? (
          <div
            className={`information-item-action-button ${saved ? 'saved' : ''}`}
            onClick={() => saveInformation()}
          >
            {star}
          </div>
        ) : null}
        {userStatus === 'admin' || userStatus === 'superAdmin' ? (
          <>
            <div className="information-item-action-button" onClick={() => deleteInformation()}>
              {trash}
            </div>
            <Link className="information-item-action-button" to={`edit-information/${id}`}>
              {edit}
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default InformationItem;
