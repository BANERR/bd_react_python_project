//react
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

//styles
import './index.scss';

//pages
import InformationList from './components/informationList/informationList';
import AddInformation from './components/addInformation/addInformation';

const router = createBrowserRouter([
  {
    path: '',
    element: <InformationList page='viewInformation'/>
  },
  {
    path: '/saved-information',
    element: <InformationList page='savedInformation'/>
  },
  {
    path: '/add-information',
    element: <AddInformation />
  },
])

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
);

