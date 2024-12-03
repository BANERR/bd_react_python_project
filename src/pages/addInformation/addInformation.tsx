//styles
import './addInformation.scss'

//components
import Header from '../../components/general/header/header';
import { useState } from 'react';
import Input from '../../components/general/input/input';
import Textarea from '../../components/general/textarea/textarea';
import Button from '../../components/general/button/button';
import { unauthorizedRequest } from '../../network/request';
import { loginUrl } from '../../network/urls';

type errors = {
  title?: string
  text?: string
}

interface FileLink {
  name: string;
  url: string;
}

const AddInformation = () => {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [file, setFile] = useState<string[]>()
  const [errors, setErrors] = useState<errors>({title: '', text: ''})

  const [fileLinks, setFileLinks] = useState<FileLink[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;
  
      const links: FileLink[] = [];
      const fileReaders: FileReader[] = [];
  
      for (const file of Array.from(files)) {
        const reader = new FileReader();
  
        reader.onload = (e) => {
          if (e.target?.result) {
            links.push({ name: file.name, url: e.target.result as string });
  
            if (links.length === files.length) {
              setFileLinks(links);
            }
          }
        };
  
        reader.readAsDataURL(file);
        fileReaders.push(reader);
      }
  }

  const checkErrors = () => {
    setErrors({title: '', text: ''})
    let flag = true
  
    if(title.length < 5){
      setErrors({...errors, title: 'Please enter title'})
      flag = false
    }
    if(text.length < 10){
      setErrors({...errors, text: 'Please enter text'})
      if (!flag) setErrors({ title: 'Please enter title', text: 'Please enter text'})
      flag = false
    }

    return flag
  }

  const fomrSubmit = () => {
    if(!checkErrors()){

      //   unauthorizedRequest(loginUrl, 'POST', {
      //       email: title,
      //       password: text
      //   }).then((response) => {
      //       console.log(response)

      //       if(response === 401){
      //           setErrors({email: 'incorrectPasOrEmail', password: 'incorrectPasOrEmail'})
      //       }else{
      //           localStorage.setItem('accessToken', response.result.access_token)
      // localStorage.setItem('refreshToken', response.result.refresh_token)
      //           navigate('/form-list')
      //       }
      //   })
    }
  }


  
  return (
    <div className="add-information-wrapper">
        <Header/>
        <div className="add-information-form-wrapper">
            <div className="add-information-form-container">
                <Input
                    type='text'
                    onChange={(e)=>setTitle(e.target.value)}
                    value={title}
                    placeholder={'Write title'}
                    error={errors.title}
                />
                <Textarea
                    value={text}
                    onChange={(e)=>setText(e.target.value)}
                    error={errors.text}
                    placeholder={'Write text'}
                />
                <input type="file" multiple onChange={handleFileChange} className='file-input'/>
                <div className='files-list'>
                    {fileLinks.map((file, index) => (
                      <a
                          className='file-name'
                          key={index}
                          href={file.url}
                          download={file.name} 

                      >
                          {file.name}
                      </a>
                    ))}
                </div>

                <Button text='Add' active={false} onClick={()=>fomrSubmit()}/>
            </div>
        </div>
    </div>
  )
}

export default AddInformation;
