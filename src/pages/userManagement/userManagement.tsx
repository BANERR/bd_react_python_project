//styles
import './userManagement.scss'

//components
import Header from '../../components/general/header/header';
import { useEffect, useState } from 'react';
import Input from '../../components/general/input/input';
import Textarea from '../../components/general/textarea/textarea';
import Button from '../../components/general/button/button';
import Pagination from '../../components/general/pagination/pagination';
import UserCard from '../../components/userCard/userCard';

type userType = {
  id: number
  name: string
  email: string
  status: string
}

const UserManagement = () => {
  const [searchValue, setSearchValue] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageNumber, setPageNumber] = useState<number>(5)
  const [usersList, setUsersList] = useState<userType[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    loadData(currentPage, searchValue)
    // .then((data) => {
    //     setInformationList([...informationList, ...data])
    // })

  }, [currentPage])

  const loadData = (page: number, request: string) => {
      setLoading(true)

      // return authorizedRequest(formsUrl + `?page=${page}&needle=${request}`, 'GET')
      // .then((response) => {            
      //   console.log(response)

      //   const { result }: { result: {
      //       forms: informationItemResponseType[],
      //       total_pages: number
      //   } } = response

      //   setPageNumber(result.total_pages)
      //   setLoading(false)

      //   return [...result.forms.map((item) => {
      //       return {
      //           id: item.id,
      //           title: item.title,
      //           text: item.text,
      //           files: item.files,
      //           saved: item.saved
      //       }
      //   })]

      // })
  }

  useEffect(()=>{
    setCurrentPage(1)
    loadData(1, searchValue)
    // .then((data) => {
    //   setInformationList([...data])
    // })

    setUsersList(
      [
        {
          id: 1,
          name: 'Artem Kurylenko',
          email: 'examle@gmail.com',
          status: 'admin',
        },
        {
          id: 2,
          name: 'Artem Kurylenko',
          email: 'examle@gmail.com',
          status: 'superAdmin',
        },
        {
          id: 3,
          name: 'Artem Kurylenko',
          email: 'examle@gmail.com',
          status: 'admin',
        },
        {
          id: 4,
          name: 'Artem Kurylenko',
          email: 'examle@gmail.com',
          status: 'user',
        },
      ]
    )
  }, [searchValue])

  
  return (
    <div className="user-management-wrapper">
      <Header/>
      <div className="user-management-container">
        <div className="user-management-search-container">
          <Input
            type='text'
            value={searchValue}
            onChange={(e)=>setSearchValue(e.target.value)}
            placeholder='Search needed user'
          />
        </div>
        <div className="user-management-list">
          {
            usersList.map((user)=>{
              return(
                <UserCard
                  key={`user-card-${user.id}`}
                  id={user.id}
                  name={user.name}
                  email={user.email}
                  status={user.status}
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

export default UserManagement;
