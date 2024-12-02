//react
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

//styles
import './index.scss';

//pages
import InformationList from './components/informationList/informationList';

const router = createBrowserRouter([
  {
    path: '',
    element: <InformationList/>
  },
])

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
);

