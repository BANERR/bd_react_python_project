
//react
import { FC, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../redux/store'

//styles
import './informationItem.scss'

//other
import { setUserData } from '../../redux/slicers/userSlice'
import { edit, star, trash } from '../../assets/icon'

type FileType = {
  id: number
  name: string
  url: string
}

type InformationItemType = {
  id: number
  title: string
  text: string
  files: FileType[]
}

type InformationItemProps = InformationItemType & {
  informationList: InformationItemType[]
  setInformationList: React.Dispatch<React.SetStateAction<InformationItemType[]>>
}

const InformationItem: FC<InformationItemProps> = ({ id, title, text, files, informationList, setInformationList }) => {
  const user = useSelector((state: RootState) => state.user.userData)
  const [saved, setSaved] = useState(user.savedInformation.includes(id))

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const saveInformation = async () => {
    if (!user.loginned) return navigate('/login')
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
      })

      const data = await response.json()

      if (response.ok) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}')
        userData.savedInformation = data
        localStorage.setItem('userData', JSON.stringify(userData))
        dispatch(setUserData(userData))
      } else {
        console.error('Error saving information.')
      }
    } catch (error) {
      console.error('Error saving information:', error)
    }
  }

  const deleteInformation = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/information/delete/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setInformationList(informationList.filter((item) => item.id !== id))
      } else {
        console.error('Failed to delete information.')
      }
    } catch (error) {
      console.error('Error deleting information:', error)
    }
  }

  return (
    <div className="information-item-wrapper">
      <div className="information-item-title-container">
        <div className="information-item-title text">{title}</div>
      </div>
      <div className="information-item-text-container">
        <div className="information-item-text text">{text}</div>
      </div>
      <div className="information-item-files-container">
        {files.map((file) => (
          <a
            href={file.url}  
            key={file.id}
            className="information-item-file"
            download={file.name}
          >
            {file.name}
          </a>
        ))}
      </div>
      <div className="information-item-action-container">
        <div
          className={`information-item-action-button ${saved ? 'saved' : ''}`}
          onClick={user.loginned ? () => saveInformation() : () => navigate('/login')}
        >
          {star}
        </div>
        {['admin', 'superAdmin'].includes(user.status) ? (
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
  )
}

export default InformationItem