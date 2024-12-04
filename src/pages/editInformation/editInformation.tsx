//styles
import './editInformation.scss'

//components
import Header from '../../components/general/header/header';
import { useEffect, useState } from 'react';
import Input from '../../components/general/input/input';
import Textarea from '../../components/general/textarea/textarea';
import Button from '../../components/general/button/button';
import { unauthorizedRequest } from '../../network/request';
import { loginUrl } from '../../network/urls';
import { trash } from '../../assets/icon';

type errors = {
    title?: string
    text?: string
}

type fileLink = {
    id: number
    name: string;
    url: string;
}

const EditInformation = () => {
    const [title, setTitle] = useState('')
    const [text, setText] = useState('')
    const [file, setFile] = useState<string[]>()
    const [errors, setErrors] = useState<errors>({title: '', text: ''})

    const [fileLinks, setFileLinks] = useState<fileLink[]>([]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;
    
        const links: fileLink[] = [];
        const fileReaders: FileReader[] = [];
    
        Array.from(files).forEach((file, index)=>{
            const reader = new FileReader();
    
            reader.onload = (e) => {
            if (e.target?.result) {
                links.push({id: index, name: file.name, url: e.target.result as string });
    
                if (links.length === files.length) {
                setFileLinks([...fileLinks, ...links]);
                }
            }
            };
    
            reader.readAsDataURL(file);
            fileReaders.push(reader);
        })
    }

    const checkErrors = () => {
        setErrors({title: '', text: ''})
        let flag = true
    
        if(title.length < 5){
                setErrors(prevErrors => ({...prevErrors, title: 'Enter your title'}))
                flag = false
            }else setErrors(prevErrors => ({...prevErrors, title: ''}))
        if(text.length < 10){
        setErrors(prevErrors => ({...prevErrors, text: 'Enter your text'}))
        flag = false
        }else setErrors(prevErrors => ({...prevErrors, text: ''}))

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

    useEffect(()=>{
        setText('lorem1vaenovlavjavjavajrk vajevbjak;vbakjevka;evkjavjk eavj akevaevae rbaebaerkba ebebabaebaerb')
        setTitle('Something')
        setFileLinks([
            {
                id: 1,
                url: 'avabafb',
                name: 'file1.txt'
            },
            {
                id: 2,
                url: 'avabafb',
                name: 'file2.txt'
            },
            {
                id: 3,
                url: 'avabafb',
                name: 'file3.txt'
            },
        ])
    },[])

    const deleteFile = (url: string) => {
        const indexToRemove = fileLinks.findIndex((file) => file.url === url);

        if (indexToRemove !== -1) {
            setFileLinks((prev) => prev.filter((_, index) => index !== indexToRemove));
        }   
    }


    
    return (
        <div className="edit-information-wrapper">
            <Header/>
            <div className="edit-information-form-wrapper">
                <div className="edit-information-form-container">
                    <Input
                        type='text'
                        onChange={(e)=>setTitle(e.target.value)}
                        value={title}
                        placeholder={'Enter title'}
                        error={errors.title}
                    />
                    <Textarea
                        value={text}
                        onChange={(e)=>setText(e.target.value)}
                        error={errors.text}
                        placeholder={'Enter text'}
                    />
                    <input type="file" multiple onChange={handleFileChange} className='file-input'/>
                    <div className='files-list'>
                        {fileLinks.map((file, index) => (
                            <div className="file-name-container">
                                    <a
                                        className='file-name'
                                        key={index}
                                        href={file.url}
                                        download={file.name} 

                                    >
                                        {file.name}
                                    </a>
                                <div className="file-delete-button" onClick={()=>deleteFile(file.url)}>
                                    {trash}
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button text='Edit' active={false} onClick={()=>fomrSubmit()}/>
                </div>
            </div>
        </div>
    )
}

export default EditInformation;
