//styles
import './informationList.scss'

//components
import Header from '../general/header/header';
import Input from '../general/input/input';
import { FC, useEffect, useState } from 'react';
import InformationItem from './informationItem/informationItem';
import Pagination from '../general/pagination/pagination';
import { formsUrl } from '../../network/urls';
import { authorizedRequest } from '../../network/request';

type informationItemType = {
  id: number
  title: string, 
  text: string, 
  files: string[],
  saved: boolean
}

type informationItemResponseType = {
  id: number
  title: string, 
  text: string, 
  files: string[],
  saved: boolean
}

const InformationList: FC<{page: string}> = ({page}) => {
  const [searchValue, setSearchValue] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageNumber, setPageNumber] = useState<number>(5)
  const [informationList, setInformationList] = useState<informationItemType[]>([])
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

    setInformationList(
      [
        {
          id: 1,
          title: 'Something',
          text: '  Lorem ipsum dolor, sit amet consectetur adipisicing elit. Mollitia, officiis atque consectetur sequi ratione culpa incidunt eum officia tenetur perferendis eius voluptates? Atque, autem. Modi vel nulla porro reiciendis temporibus quae, dicta pariatur, omnis cupiditate ea laborum sint vero, voluptas possimus ex atque! Nulla qui hic quod dicta perspiciatis velit, nam asperiores. Optio quisquam minima voluptatibus blanditiis reprehenderit consectetur repellat eveniet totam? Dolore sed quos id repellendus. Dignissimos asperiores excepturi quo explicabo reiciendis architecto, eum culpa ullam ex porro! Ducimus deserunt veniam officia iure! Asperiores odit corporis quas dicta tempore id, reprehenderit soluta minima, ullam fuga repudiandae sequi necessitatibus impedit.',
          files: [],
          saved: true
        },
        {
          id: 2,
          title: 'Something',
          text: '  Lorem ipsum dolor, sit amet consectetur adipisicing elit.',
          files: [],
          saved: false
        },
        {
          id: 3,
          title: 'Something',
          text: '  Lorem ipsum dolor, sit amet consectetur adipisicing elit. Mollitia, officiis atque consectetur sequi ratione culpa incidunt eum officia tenetur perferendis eius voluptates? Atque, autem. Modi vel nulla porro reiciendis temporibus quae, dicta pariatur, omnis cupiditate ea laborum sint vero, voluptas possimus ex atque! Nulla qui hic quod dicta perspiciatis velit, nam asperiores. Optio quisquam minima voluptatibus blanditiis reprehenderit consectetur repellat eveniet totam? Dolore sed quos id repellendus. Dignissimos asperiores excepturi quo explicabo reiciendis architecto, eum culpa ullam ex porro! Ducimus deserunt veniam officia iure! Asperiores odit corporis quas dicta tempore id, reprehenderit soluta minima, ullam fuga repudiandae sequi necessitatibus impedit.',
          files: [],
          saved: true
        },
        {
          id: 4,
          title: 'Something',
          text: '  Lorem ipsum dolor, sit amet consectetur adipisicing elit. Mollitia, officiis atque consectetur sequi ratione culpa incidunt eum officia tenetur perferendis eius voluptates? Atque, autem. Modi vel nulla porro reiciendis temporibus quae, dicta pariatur, omnis cupiditate ea laborum sint vero, voluptas possimus ex atque! Nulla qui hic quod dicta perspiciatis velit, nam asperiores. Optio quisquam minima voluptatibus blanditiis reprehenderit consectetur repellat eveniet totam? Dolore sed quos id repellendus. Dignissimos asperiores excepturi quo explicabo reiciendis architecto, eum culpa ullam ex porro! Ducimus deserunt veniam officia iure! Asperiores odit corporis quas dicta tempore id, reprehenderit soluta minima, ullam fuga repudiandae sequi necessitatibus impedit.',
          files: [],
          saved: true
        },
      ]
    )
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
                  files={item.files}
                  saved={item.saved}
                  id={item.id}
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
