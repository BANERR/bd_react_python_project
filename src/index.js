//react
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

//styles
import './index.scss';

//pages
import InformationList from './pages/informationList/informationList';
import AddInformation from './pages/addInformation/addInformation';
import UserManagement from './pages/userManagement/userManagement';
import Login from './pages/login/login';
import Registration from './pages/registration/registration';
import EditInformation from './pages/editInformation/editInformation';
import Profile from './pages/profile/profile';

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
  {
    path: '/user-management',
    element: <UserManagement />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/registration',
    element: <Registration />
  },
  {
    path: '/edit-information/:id',
    element: <EditInformation />
  },
  {
    path: '/profile/:id',
    element: <Profile />
  },
])

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
);

