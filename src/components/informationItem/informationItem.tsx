//styles
import { FC } from 'react';
import { edit, star, trash } from '../../assets/icon';
import './informationItem.scss'
import { Link } from 'react-router-dom';

type informationItemType = {
  id: number
  title: string, 
  text: string, 
  files: string[],
  saved: boolean
}

const InformationItem: FC<informationItemType> = ({id, title, text, files, saved}) => {
  return (
    <div className="information-item-wrapper">
      <div className="information-item-title-container">
        <div className="information-item-title text">
          {title}
        </div>
      </div>
      <div className="information-item-text-container">
        <div className="information-item-text text">
          {text}
        </div>
      </div>
      <div className="information-item-files-container">
        {
          files.map((file)=>{
            return(
              <div className="information-item-file text">
                {file}
              </div>
            )
          })
        }
      </div>
      <div className="information-item-action-container">
        <div className={`information-item-action-button ${saved ? 'saved' : ''}`}>{star}</div>
        <div className="information-item-action-button">{trash}</div>
        <Link className='information-item-action-button' to={`edit-information/${id}`}>{edit}</Link>
      </div>
    </div>
  )
}

export default InformationItem;
