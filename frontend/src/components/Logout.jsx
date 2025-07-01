import React from 'react'
import { useContext, useState } from 'react'
import userContext from '../contexts/UserContext/userContext'
import UserState from '../contexts/UserContext/UserState'
import { TbLogout2 } from "react-icons/tb";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Logout = () => {
    const { logout } = useContext(userContext)
    const navigate = useNavigate()
    const handleClick = () => {
       try{ logout();
        navigate('/login');
       }catch(e){
         toast.error(e.message);
       }
    }

    return (
  <div
  onClick={handleClick}
  className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2 bg-gray-800 text-white hover:bg-red-600 rounded-lg cursor-pointer transition-all duration-200 w-full"
>
  <TbLogout2 className="text-xl" />
  <span className="text-sm sm:text-md font-medium" aria-label="Logout from Talkky">Logout</span>
</div>

    )
}

export default Logout