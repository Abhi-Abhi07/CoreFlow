import React from 'react';
import { BrowserRouter as Router, Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import Layout from './Layout.jsx'
import Home from './pages/Home.jsx'
import Algorithms from './pages/Algorithms.jsx';
import Monitor from './pages/Monitor.jsx';
import Documentation from './pages/Documentation.jsx';
import GetStarted from './pages/GetStarted.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx';
import Verify from './pages/Verify.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Simulation from './pages/Simulation.jsx';


const router=createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path='/' element={<Layout/>}>
            <Route path='' element={<Home/>}/>
            <Route path='algorithms/' element={<Algorithms/>}/>
            <Route path="simulation/" element={<Simulation />} />
            <Route path='monitor/' element={<Monitor/>}/>
            <Route path='docs/' element={<Documentation/>}/>
            <Route path="profile/:userId" element={<Profile />} />
        </Route>
          <Route path='get-started/' element={<GetStarted/>}/>
          <Route path="login/" element={<Login />} />
          <Route path='verify' element={<Verify/>} />
          <Route path='verify/:token' element={<VerifyEmail/>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
      </>
    )
)


export default function App() {
  return (
    <RouterProvider router={router}/>
  );
}