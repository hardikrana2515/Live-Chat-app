import { useContext } from 'react'
import userContext from '../contexts/UserContext/userContext'
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
  className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2 bg-[var(--c-panel)] text-[var(--c-text)] hover:bg-[var(--c-danger)] rounded-lg cursor-pointer transition-all duration-200 w-full"
>
  <TbLogout2 className="text-xl" />
  <span className="text-sm sm:text-md font-medium" aria-label="Logout from Talkyy">Logout</span>
</div>

    )
}

export default Logout