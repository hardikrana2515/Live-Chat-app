import UserContext from "./userContext";
import API from "../Api.js"
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from "react-router-dom"
import { toast } from 'react-toastify'
import {
    setCurrentUser,
    ensureIdentityKey,
    clearRuntimeKeys,
    hasLocalIdentityKey,
    generateNewIdentityKey,
    saveRecoveredIdentityKey,
    clearLocalIdentityKey
} from '../../utils/cryptoKeys'
import {
    encryptIdentityVault,
    decryptIdentityVault
} from '../../utils/keyVault'


const UserState = ({ children }) => {

    const [login, setLogin] = useState(true);
    const [error, setError] = useState('');
    const [, setLoading] = useState(false)
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
    const [logoutModal, setLogoutModal] = useState(false);
    const [identityState, setIdentityState] = useState('IDLE'); // 'IDLE' | 'CHECKING' | 'READY' | 'SETUP_REQUIRED' | 'RECOVERY_REQUIRED' | 'UNRECOVERABLE' | 'MISMATCH'
    const [vaultData, setVaultData] = useState(null);
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [showRecoveryModal, setShowRecoveryModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const navigate = useNavigate()

    // Make the active user available to the E2EE layer during render (before
    // any child effect runs) so key derivation works on first paint. (Issue 3.2)
    setCurrentUser(user?._id || null);

    const checkIdentityStatus = useCallback(async (targetUser = user) => {
        const uid = targetUser?._id;
        const token = targetUser?.token || localStorage.getItem("token");
        if (!uid || !token) return;

        setIdentityState('CHECKING');
        try {
            const res = await API.get("user/vault", {
                headers: { Authorization: token },
                withCredentials: true
            });
            const data = res.data?.data || {};
            setVaultData(data);

            const hasLocal = hasLocalIdentityKey(uid);

            if (hasLocal) {
                const localIdentity = await ensureIdentityKey(uid);
                if (localIdentity?.publicKeyB64) {
                    if (data.publicKey && data.publicKey !== localIdentity.publicKeyB64) {
                        console.warn("[E2EE] Identity mismatch between local key and server identity.");
                        setIdentityState('MISMATCH');
                        return;
                    }
                    setIdentityState('READY');
                    // If local key is present but no vault is stored yet, prompt user to back it up
                    if (!data.hasVault) {
                        setShowSetupModal(true);
                    }
                    return;
                }
            }

            // Local private key is absent
            if (data.hasVault && data.vault) {
                console.info("[E2EE] Local key absent. Vault found on server. Recovery required.");
                setIdentityState('RECOVERY_REQUIRED');
                setShowRecoveryModal(true);
            } else if (!data.hasIdentity) {
                console.info("[E2EE] No registered identity found. Initial key setup required.");
                setIdentityState('SETUP_REQUIRED');
                setShowSetupModal(true);
            } else {
                console.warn("[E2EE] Server has registered identity but no vault is available. Identity unrecoverable.");
                setIdentityState('UNRECOVERABLE');
            }
        } catch (e) {
            console.warn("[E2EE] Failed to verify identity status:", e);
            setIdentityState('IDLE');
        }
    }, [user]);

    // Check identity status whenever authenticated user changes
    useEffect(() => {
        if (!user?._id) return;
        checkIdentityStatus(user);
    }, [user?._id, checkIdentityStatus]);

    const performInitialSetup = async (recoverySecret) => {
        const uid = user?._id;
        if (!uid) throw new Error("User must be logged in.");

        const identity = await generateNewIdentityKey(uid);
        const identityId = `id_${uid}_${Date.now()}`;
        const { vault, publicKeyFingerprint } = await encryptIdentityVault(
            identity.privateKey,
            identity.publicKeyB64,
            identityId,
            recoverySecret
        );

        await API.post("user/vault", {
            identityId,
            version: 1,
            publicKey: identity.publicKeyB64,
            publicKeyFingerprint,
            vault
        }, {
            headers: { Authorization: user.token || localStorage.getItem("token") },
            withCredentials: true
        });

        setIdentityState('READY');
        setVaultData({
            hasIdentity: true,
            hasVault: true,
            identityId,
            version: 1,
            publicKey: identity.publicKeyB64,
            publicKeyFingerprint,
            vault
        });
        toast.success("Encryption key vault created successfully!");
    };

    const performIdentityRecovery = async (recoverySecret) => {
        const uid = user?._id;
        if (!uid) throw new Error("User must be logged in.");
        if (!vaultData?.vault) throw new Error("No vault envelope found on server.");

        const recovered = await decryptIdentityVault(
            vaultData.vault,
            recoverySecret,
            vaultData.publicKey
        );

        await saveRecoveredIdentityKey(
            uid,
            recovered.privateKey,
            recovered.publicKeyB64
        );

        setIdentityState('READY');
        toast.success("Encryption keys restored! Messages will now decrypt.");
    };

    const performIdentityReset = async (password) => {
        const uid = user?._id;
        if (!uid) throw new Error("User must be logged in.");

        await API.post("user/identity/reset", {
            password,
            confirmReset: true
        }, {
            headers: { Authorization: user.token || localStorage.getItem("token") },
            withCredentials: true
        });

        clearLocalIdentityKey(uid);
        setIdentityState('SETUP_REQUIRED');
        setShowSetupModal(true);
        toast.info("Identity reset. Setting up fresh encryption keypair.");
    };

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
        } catch {
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
            await API.put("user/changePassword", { oldpassword, newpassword }, {
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
            return res.data?.data || res.data || true;
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
        <UserContext.Provider value={{
            login, setLogin, signup, LoginFunc, setError, error,
            Alluser, setLoading, searchUser, setSearchUser, GetUser, refreshUser,
            user, logout, setCard, card, UploadImg, updatePassword,
            setpass, pass, sendRequest, acceptRequest, getFriendRequests, friendRequests,
            logoutModal, setLogoutModal,
            identityState, setIdentityState,
            vaultData, setVaultData,
            showSetupModal, setShowSetupModal,
            showRecoveryModal, setShowRecoveryModal,
            showResetModal, setShowResetModal,
            checkIdentityStatus,
            performInitialSetup,
            performIdentityRecovery,
            performIdentityReset
        }}>
            {children}
        </UserContext.Provider>
    )
}

export default UserState