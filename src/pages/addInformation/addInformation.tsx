//styles
import './addInformation.scss'

//react
import { useState } from 'react'

//components
import Header from '../../components/general/header/header'
import Input from '../../components/general/input/input'
import Textarea from '../../components/general/textarea/textarea'
import Button from '../../components/general/button/button'

type errors = {
  title?: string
  text?: string
}

interface FileLink {
  name: string
  url: string
}

const AddInformation = () => {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [fileLinks, setFileLinks] = useState<FileLink[]>([])
  const [errors, setErrors] = useState<errors>({ title: '', text: '' })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const links: FileLink[] = Array.from(files).map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }))

    setFileLinks(links)
  }

  const checkErrors = () => {
    setErrors({ title: '', text: '' })
    let isValid = true

    if (title.length < 5) {
      setErrors(prevErrors => ({ ...prevErrors, title: 'Enter a valid title' }))
      isValid = false
    }
    if (text.length < 10) {
      setErrors(prevErrors => ({ ...prevErrors, text: 'Enter a valid text' }))
      isValid = false
    }

    return isValid
  }

  const formSubmit = async () => {
    if (!checkErrors()) return
  
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('text', text)
  
      const fileInputs = document.querySelector('.file-input') as HTMLInputElement
      if (fileInputs?.files) {
        Array.from(fileInputs.files).forEach(file => formData.append('files', file))
      }

      for (const pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1])
      }
  
      const response = await fetch('http://localhost:5000/api/information/add', {
        method: 'POST',
        body: formData,
      })
  
      if (response.ok) {
        const result = await response.json()
        if (result.message === 'Information and files saved successfully') {
          console.log('Information added successfully!')
        } else {
          console.log('Error saving information.')
        }
      } else {
        console.error('Server error:', response.statusText)
      }
    } catch (error) {
      console.error('Request error:', error)
    }
  }
  

  return (
    <div className="add-information-wrapper">
      <Header />
      <div className="add-information-form-wrapper">
        <div className="add-information-form-container">
          <Input
            type="text"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
            placeholder="Enter title"
            error={errors.title}
          />
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            error={errors.text}
            placeholder="Enter text"
          />
          <input type="file" multiple onChange={handleFileChange} className="file-input" />
          <div className="files-list">
            {fileLinks.map((file, index) => (
              <a
                className="file-name"
                key={index}
                href={file.url}
                download={file.name}
              >
                {file.name}
              </a>
            ))}
          </div>
          <Button text="Add" active={true} onClick={formSubmit} />
        </div>
      </div>
    </div>
  )
}

export default AddInformation
