//react
import { useEffect, useState } from 'react'

//styles
import './userManagement.scss'

//components
import Header from '../../components/general/header/header'
import Input from '../../components/general/input/input'
import Pagination from '../../components/general/pagination/pagination'
import UserCard from '../../components/userCard/userCard'

type userType = {
  id: number
  full_name: string
  email: string
  status: string
}

const UserManagement = () => {
  const [searchValue, setSearchValue] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageNumber, setPageNumber] = useState<number>(5)
  const [usersList, setUsersList] = useState<userType[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData(currentPage, searchValue)
  }, [currentPage, searchValue])

  const loadData = async (page: number, search: string) => {
    setLoading(true)

    const requestData = {
      search_value: search,
      page_number: page
    }

    try {
      const response = await fetch('http://localhost:5000/api/users-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()

      if (response.ok) {
        setUsersList(data.users_list)
        setPageNumber(data.total_pages)
      } else {
        console.error('Error fetching users:', data.error)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="user-management-wrapper">
      <Header />
      <div className="user-management-container">
        <div className="user-management-search-container">
          <Input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search needed user"
          />
        </div>
        <div className="user-management-list">
          {loading ? (
            <p>Loading...</p>
          ) : (
            usersList.map((user) => (
              <UserCard
                key={`user-card-${user.id}`}
                id={user.id}
                name={user.full_name}
                email={user.email}
                status={user.status}
              />
            ))
          )}
        </div>
        <Pagination totalPages={pageNumber} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
    </div>
  )
}

export default UserManagement
