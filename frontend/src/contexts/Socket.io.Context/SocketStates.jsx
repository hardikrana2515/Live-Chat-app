import { useContext, useEffect, useRef, useState } from 'react'
import SocketContext from './socket.Context';
import io from 'socket.io-client'
import userContext from '../UserContext/userContext';

const SocketStates = ({ children, ENDPOINT }) => {
    const socket = useRef();
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [socketInstance, setSocketInstance] = useState(null);
    const { user } = useContext(userContext);
    const prevUserIdRef = useRef(null);
    const prevTokenRef = useRef(null);

    useEffect(() => {
        let userinfo = user?._id ? user : null;
        if (!userinfo) {
            try {
                userinfo = JSON.parse(localStorage.getItem("userInfo"));
            } catch {
                userinfo = null;
            }
        }

        const token = user?.token || localStorage.getItem("token");

        // Do not attempt connection if unauthenticated or token is missing
        if (!userinfo || !userinfo._id || !token) {
            if (socket.current) {
                socket.current.disconnect();
                socket.current = null;
            }
            prevUserIdRef.current = null;
            prevTokenRef.current = null;
            setIsConnected(false);
            setSocketInstance(null);
            return;
        }

        const isUserChanged = prevUserIdRef.current && prevUserIdRef.current !== userinfo._id;
        const isTokenChanged = prevTokenRef.current && prevTokenRef.current !== token;
        prevUserIdRef.current = userinfo._id;
        prevTokenRef.current = token;

        // If user or authentication token changed, disconnect old session
        if (socket.current && (isUserChanged || isTokenChanged)) {
            socket.current.disconnect();
            socket.current = null;
            setIsConnected(false);
            setSocketInstance(null);
        }

        if (!socket.current && ENDPOINT) {
            const s = io(ENDPOINT, {
                transports: ['polling', 'websocket'],
                withCredentials: true,
                auth: {
                    token: token
                }
            });
            socket.current = s;
            setSocketInstance(s);

            // Keep auth token fresh on reconnect attempts
            if (s.io) {
                s.io.on("reconnect_attempt", () => {
                    const freshToken = localStorage.getItem("token") || user?.token;
                    if (freshToken) {
                        s.auth = { token: freshToken };
                    }
                });
            }

            s.on("connect", () => {
                setIsConnected(true);
                s.emit("setup", userinfo);
            });

            // Re-join personal room after reconnection so events resume
            s.on("reconnect", () => {
                setIsConnected(true);
                const freshToken = localStorage.getItem("token") || user?.token;
                if (freshToken) {
                    s.auth = { token: freshToken };
                }
                s.emit("setup", userinfo);
                console.log("[Socket] Reconnected with authenticated session");
            });

            s.on("connect_error", (err) => {
                console.warn("[Socket] Connection error:", err?.message);
                setIsConnected(false);
            });

            s.on("disconnect", (reason) => {
                console.log("[Socket] Disconnected:", reason);
                setIsConnected(false);
            });
        } else if (socket.current.connected) {
            setIsConnected(true);
            setSocketInstance(socket.current);
            socket.current.emit("setup", userinfo);
        }

        const handleOnlineUsers = (users) => {
            setOnlineUsers(users);
        };

        socket.current.off("getOnlineUsers");
        socket.current.on("getOnlineUsers", handleOnlineUsers);

        return () => {
            if (socket.current) {
                socket.current.off("getOnlineUsers", handleOnlineUsers);
            }
        };
    }, [user, ENDPOINT]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers, isConnected, socketInstance }}>
            {children}
        </SocketContext.Provider>
    )
}

export default SocketStates
