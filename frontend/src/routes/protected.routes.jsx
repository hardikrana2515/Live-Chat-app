import React,{useEffect} from 'react'
import { useNavigate } from 'react-router-dom';


const ProtectedRoute = (props) => {
    const navigate = useNavigate();
    const {Component} = props;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
           navigate('/login')
        } 
      },[])
      
      return (
    <div>
        <Component/>
    </div>
  )
}

export default ProtectedRoute