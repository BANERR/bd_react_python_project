//styles
import './informationList.scss'

//components
import Header from '../../components/general/header/header';
import Input from '../../components/general/input/input';
import { FC, useEffect, useState } from 'react';
import InformationItem from '../../components/informationItem/informationItem';
import Pagination from '../../components/general/pagination/pagination';
import { formsUrl } from '../../network/urls';
import { authorizedRequest } from '../../network/request';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

type informationItemType = {
  id: number
  title: string, 
  text: string, 
  path: string[],
}

type informationItemResponseType = {
  id: number
  title: string, 
  text: string, 
  path: string[],
}

const InformationList: FC<{page: string}> = ({page}) => {
  const [searchValue, setSearchValue] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageNumber, setPageNumber] = useState<number>(5)
  const [informationList, setInformationList] = useState<informationItemType[]>([])

  const user = useSelector((state: RootState) => state.user.userData);

  useEffect(()=>{
    if(user.id !== 0) loadData(currentPage, searchValue)
  }, [currentPage, page, user])

  const loadData = async (pageNumber: number, request: string) => {
    try{
      const response = await fetch('http://localhost:5000/api/information-list', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: user.id,
            page_type: page,
            search_value: request,
            page_number: pageNumber
        }),
      });

      if (response.ok) {
        const data = await response.json()

        const informationData: informationItemType[] = []

        setPageNumber(data.total_pages)

        data.information_list.map((informationItem: informationItemResponseType)=>{
          informationData.push({
            id: informationItem.id,
            title: informationItem.title,
            text: informationItem.text,
            path: informationItem.path
          })
        })

        setInformationList(informationData)
          
      } else {
        console.error('Error');

      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  }

  useEffect(()=>{
    setCurrentPage(1)
    loadData(1, searchValue)
  }, [searchValue])


  return (
    <div className="information-list-wrapper">
      <Header/>
      <div className="information-list-container">
        <div className="information-list-search-container">
          <Input
            type='text'
            value={searchValue}
            onChange={(e)=>setSearchValue(e.target.value)}
            placeholder='Search needed information'
          />
        </div>
        <div className="information-list">
          {
            informationList.map((item)=>{
              return(
                <InformationItem
                  key={`information-item-${item.id}`}
                  title={item.title}
                  text={item.text}
                  path={item.path}
                  id={item.id}
                  informationList={informationList}
                  setInformationList={setInformationList}
                />
              )
            })
          }
        </div>
        <Pagination totalPages={pageNumber} currentPage={currentPage} setCurrentPage={setCurrentPage}/>

      </div>
    </div>
  )
}

export default InformationList;
