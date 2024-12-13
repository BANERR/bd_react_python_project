//styles
import './editInformation.scss';

//components
import Header from '../../components/general/header/header';
import { useEffect, useRef, useState } from 'react';
import Input from '../../components/general/input/input';
import Textarea from '../../components/general/textarea/textarea';
import Button from '../../components/general/button/button';
import { trash } from '../../assets/icon';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

type errors = {
    title?: string;
    text?: string;
};

type fileLink = {
    id: number;
    name: string;
    url: string;
};

const EditInformation = () => {
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [errors, setErrors] = useState<errors>({ title: '', text: '' });
    const [fileLinks, setFileLinks] = useState<fileLink[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [deletedFiles, setDeletedFiles] = useState<number[]>([]);

    const { informationId } = useParams<{ informationId: string }>();
    const user = useSelector((state: RootState) => state.user.userData);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchInformation = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/get-information`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                user_id: user.id,
                information_id: informationId,
                }),
            });
            if (!response.ok) throw new Error('Failed to fetch information');

            const data = await response.json();
            setTitle(data.title);
            setText(data.text);
            setFileLinks(data.files.map((file: any) => ({
                id: file.id,
                name: file.name,
                url: `http://localhost:5000/api/files/${file.id}/download`,
            })));
        } catch (error) {
            console.error('Error fetching information:', error);
        }
    };


    // Отримання інформації з сервера
    useEffect(() => {
        fetchInformation();
    }, [informationId, user]);

    // Обробка зміни файлів
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setNewFiles(Array.from(event.target.files));
        }
    };

    // Видалення файлу локально
    const deleteFile = (url: string, fileId: number) => {
        setFileLinks((prev) => prev.filter((file) => file.url !== url));
        setDeletedFiles((prev) => [...prev, fileId]); // Додаємо ID файлу для видалення
    };

    // Перевірка помилок
    const checkErrors = () => {
        let isValid = true;
        const newErrors: errors = { title: '', text: '' };

        if (title.length < 5) {
            newErrors.title = 'Title must be at least 5 characters';
            isValid = false;
        }

        if (text.length < 10) {
            newErrors.text = 'Text must be at least 10 characters';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // Надсилання форми
    const formSubmit = async () => {
        if (!checkErrors()) return;
    
        const formData = new FormData();
        formData.append('title', title);
        formData.append('text', text);
    
        // Convert deleted files array to JSON string for the backend
        formData.append('deleted_files', JSON.stringify(deletedFiles));
    
        // Append the new files to the FormData object
        newFiles.forEach((file) => {
            formData.append('files', file);
        });
    
        try {
            const response = await fetch(`http://localhost:5000/api/information/${informationId}`, {
                method: 'PUT',
                body: formData,  // Send FormData (multipart/form-data)
            });
    
            if (!response.ok) throw new Error('Failed to update information');
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Clear the input field
            }
            fetchInformation();
            setNewFiles([]);
            setDeletedFiles([]); // Clear the deleted files list
        } catch (error) {
            console.error('Error updating information:', error);
        }
    };
    

    return (
        <div className="edit-information-wrapper">
            <Header />
            <div className="edit-information-form-wrapper">
                <div className="edit-information-form-container">
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
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="file-input"
                        ref={fileInputRef}
                    />
                    <div className="files-list">
                        {fileLinks.map((file) => (
                            <div className="file-name-container" key={file.id}>
                                <a
                                    className="file-name"
                                    href={file.url}
                                    download={file.name}
                                >
                                    {file.name}
                                </a>
                                <div
                                    className="file-delete-button"
                                    onClick={() => deleteFile(file.url, file.id)}
                                >
                                    {trash}
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button text="Edit" active={false} onClick={formSubmit} />
                </div>
            </div>
        </div>
    );
};

export default EditInformation;
