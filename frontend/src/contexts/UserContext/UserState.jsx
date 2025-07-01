import userContext from "./userContext";
import API from "../Api.js"
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
const UserState = ({ children }) => {

    const [login, setLogin] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false)
    const [searchUser, setSearchUser] = useState([])
    const [user, setUser] = useState({})
    const [card, setCard] = useState(false)
    const [pass, setpass] = useState(false)

    const signup = async (name, gender, userName, phonenumber, email, password) => {

        try {
            const res = await API.post("user/register", { name, gender, userName, phonenumber, email, password }, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            })

            setTimeout(() => {
                setLogin(true);
            }, 2000);

            // console.log(res.data.data);
            return res.data
        } catch (e) {
            const errorMessage = e?.response?.data?.message || "Signup failed";
            throw new Error(errorMessage);
        }
    }

    const LoginFunc = async (email, phonenumber, password) => {
        try {
            const res = await API.post("user/login", { email, phonenumber, password }, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            })
            localStorage.setItem("token", res.data.Authtoken);
            localStorage.setItem("userInfo", JSON.stringify(res.data.data.loggedinUser))
            // console.log(res.data);
            return res.data
        } catch (e) {

            const errorMessage = e?.response?.data?.message || "Login failed";
            throw new Error(errorMessage);
        }
    }

    const GetUser = async () => {
        try {
            const res = await API.get("user/getUser", {}, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            })

            setUser(res.data.data)
        } catch (e) {
            const errorMessage = e?.response?.data?.message || "Cant show Profile";
            throw new Error(errorMessage);
        }
    }

    const Alluser = async (search) => {
        setLoading(true)
        try {
            const res = await API.get("user/Alluser",
                {
                    params: { search },
                    headers: {
                        "Content-Type": "application/json"
                    },
                    withCredentials: true
                })
            if (res.data.data.length === 0) {
                toast.info("No matches found!");
                setSearchUser([]);
            } else {
                setSearchUser(res.data.data);

            }

            // console.log(res.data.data);
        } catch (e) {
            const errorMessage = e?.response?.data?.message || "Search failed";
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }

   

    const logout = async () => {
        try {
            const res = await API.post("user/logout", {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            })

            localStorage.removeItem("token");
            toast.done("Log out Successfully !!!")
            setUser({})
            setLogin(true)
        } catch (e) {
            const errorMessage = e?.response?.data?.message || "Logout failed";
            throw new Error(errorMessage);
        }
    }

    const UploadImg = async (formData) => {
        try {
            const res = await API.put("user/image", formData, {
                withCredentials: true
            })
            console.log(res.data)
                return res.data;

        } catch (e) {
           
             const errorMessage = e?.response?.data?.message || "Cannot Upload Immage";
            throw new Error(errorMessage);
        }
    }

    const updatePassword = async(oldpassword,newpassword)=>{
           try{ const res = await API.put("user/changePassword",{oldpassword,newpassword},{
                 headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            })

            // console.log(res.data)
        }catch(e){
            const errorMessage = e?.response?.data?.message || "Cannot Update Password";
            throw new Error(errorMessage);
        }

    }



    return (
        <userContext.Provider value={{
            login, setLogin, signup, LoginFunc, setError, error,
            Alluser, setLoading, searchUser, setSearchUser, GetUser,
            user, logout, setCard, card,UploadImg,updatePassword,
            setpass,pass
        }}>
            {children}
        </userContext.Provider>
    )
}

export default UserState