//styles
import './addInformation.scss'

//components
import Header from '../general/header/header';
import { useState } from 'react';
import Input from '../general/input/input';
import Textarea from '../general/textarea/textarea';

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
            </div>
        </div>
    </div>
  )
}

export default AddInformation;
