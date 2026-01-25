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

        if (!name || !gender || !userName || !phonenumber || !email || !password) {
            throw new Error("Please fill in all fields.");
        }
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

    const updatePassword = async (oldpassword, newpassword) => {
        try {
            const res = await API.put("user/changePassword", { oldpassword, newpassword }, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            })

            // console.log(res.data)
        } catch (e) {
            const errorMessage = e?.response?.data?.message || "Cannot Update Password";
            throw new Error(errorMessage);
        }

    }



    const sendRequest = async (userId) => {
        try {
            const token = localStorage.getItem("token");
            const res = await API.post("user/request/send", { userId }, {
                headers: { Authorization: user.token || token },
                withCredentials: true
            });
            toast.success(res.data.message);
            return true;
        } catch (e) {
            toast.error(e?.response?.data?.message || "Failed to send request");
            return false;
        }
    }

    const acceptRequest = async (requestId, status) => {
        try {
            const token = localStorage.getItem("token");
            const res = await API.post("user/request/accept", { requestId, status }, {
                headers: { Authorization: user.token || token },
                withCredentials: true
            });
            toast.success(res.data.message);
            return true;
        } catch (e) {
            toast.error(e?.response?.data?.message || "Failed to accept request");
            return false;
        }
    }

    // We need to fetch requests frequently or on load
    const [friendRequests, setFriendRequests] = useState([]);
    const getFriendRequests = async () => {
        try {
            // Ensure user.token exists before call
            const token = localStorage.getItem("token"); // Fallback check
            if (!user.token && !token) return;

            const res = await API.get("user/request/get", {
                headers: { Authorization: user.token || token },
                withCredentials: true
            });
            setFriendRequests(res.data.data);
        } catch (e) {
            console.error("Failed to fetch requests", e);
        }
    }

    // Refresh user profile to get latest friends list
    const refreshUser = async () => {
        await GetUser();
    }

    return (
        <userContext.Provider value={{
            login, setLogin, signup, LoginFunc, setError, error,
            Alluser, setLoading, searchUser, setSearchUser, GetUser, refreshUser,
            user, logout, setCard, card, UploadImg, updatePassword,
            setpass, pass, sendRequest, acceptRequest, getFriendRequests, friendRequests
        }}>
            {children}
        </userContext.Provider>
    )
}

export default UserState