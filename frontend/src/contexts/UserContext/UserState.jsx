import userContext from "./userContext";
import API from "../Api.js"
import { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom"
import { toast } from 'react-toastify'
import { setCurrentUser, ensureIdentityKey, clearRuntimeKeys } from '../../utils/cryptoKeys'


const UserState = ({ children }) => {

    const [login, setLogin] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false)
    const [searchUser, setSearchUser] = useState([])
    // Single source of truth for the logged-in user (Issue 3.1).
    // Initialized lazily from localStorage so it is available before any effect runs.
    const [user, setUser] = useState(() => {
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const token = localStorage.getItem("token");
            return userInfo ? { ...userInfo, token } : {};
        } catch {
            return {};
        }
    });
    const [card, setCard] = useState(false)
    const [pass, setpass] = useState(false)
    const navigate = useNavigate()

    // Make the active user available to the E2EE layer during render (before
    // any child effect runs) so key derivation works on first paint. (Issue 3.2)
    setCurrentUser(user?._id || null);

    // Publish this device's ECDH public key so chat peers can derive shared
    // conversation keys. The private key never leaves this device. (Issue 3.2)
    useEffect(() => {
        if (!user?._id) return;
        let cancelled = false;
        (async () => {
            try {
                const identity = await ensureIdentityKey(user._id);
                if (!identity || cancelled) return;
                await API.put("user/publickey", { publicKey: identity.publicKeyB64 }, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: localStorage.getItem("token")
                    },
                    withCredentials: true
                });
            } catch (e) {
                console.warn("Failed to publish public key:", e?.response?.data?.message || e?.message);
            }
        })();
        return () => { cancelled = true; };
    }, [user?._id]);

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
            const token = res.data.data.Authtoken;
            const userInfo = res.data.data.loggedinUser;
            localStorage.setItem("token", token);
            localStorage.setItem("userInfo", JSON.stringify(userInfo));
            setUser({ ...userInfo, token });
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

            // Preserve the auth token (the API response does not include it)
            const freshUser = res.data.data || {};
            const token = freshUser.token || user.token || localStorage.getItem("token");
            const merged = token ? { ...freshUser, token } : freshUser;
            setUser(merged);
            // Keep localStorage in sync so a reload shows fresh profile data too
            try {
                const { token: _omit, ...persisted } = merged;
                localStorage.setItem("userInfo", JSON.stringify(persisted));
            } catch { /* ignore persist errors */ }
        } catch (e) {
            const errorMessage = e?.response?.data?.message || "Cant show Profile";
            throw new Error(errorMessage);
        }
    }

    const Alluser = async (search, silent = false) => {
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
                if (!silent) toast.info("No matches found!");
                setSearchUser([]);
            } else {
                setSearchUser(res.data.data);
            }
        } catch (e) {
            setSearchUser([]);
            const errorMessage = e?.response?.data?.message || "Search failed";
            if (!silent) toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    const logout = async () => {
        // Drop cached conversation keys/registry so nothing from this account
        // can be decrypted by the next one in this tab (identity keys themselves
        // stay in localStorage so re-login can still read old messages).
        clearRuntimeKeys();
        try {
            await API.post("user/logout", {}, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            });

            localStorage.removeItem("token");
            localStorage.removeItem("userInfo");
            toast.success("Logged out successfully!");
            setUser({});
            setLogin(true);
            navigate("/login");
        } catch (e) {
            localStorage.removeItem("token");
            localStorage.removeItem("userInfo");
            setUser({});
            setLogin(true);
            navigate("/login");
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