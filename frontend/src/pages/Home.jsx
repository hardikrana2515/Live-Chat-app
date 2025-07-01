import {useEffect} from 'react'
import {useNavigate} from "react-router-dom"
import Loader from '../components/Loader'
const Home = () => {

   const navigate = useNavigate()
  
          useEffect(()=>{
                  const userinfo = JSON.parse(localStorage.getItem("userInfo"))
                  if(!userinfo){
                     navigate("/login")
                  }else{
                    navigate("/chat")
                  }
          }
         ,[] )

  return (
    <div className='text-2xl text-white flex ustify-center items-center '>
        <Loader/>
    </div>
  )
}

export default Home