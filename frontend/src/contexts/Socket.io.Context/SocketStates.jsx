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

    useEffect(() => {
        let userinfo = user?._id ? user : null;
        if (!userinfo) {
            try {
                userinfo = JSON.parse(localStorage.getItem("userInfo"));
            } catch {
                userinfo = null;
            }
        }

        if (!userinfo || !userinfo._id) {
            if (socket.current) {
                socket.current.disconnect();
                socket.current = null;
            }
            prevUserIdRef.current = null;
            setIsConnected(false);
            setSocketInstance(null);
            return;
        }

        const isUserChanged = prevUserIdRef.current && prevUserIdRef.current !== userinfo._id;
        prevUserIdRef.current = userinfo._id;

        if (socket.current && isUserChanged) {
            socket.current.disconnect();
            socket.current = null;
            setIsConnected(false);
            setSocketInstance(null);
        }

        if (!socket.current) {
            const s = io(ENDPOINT, {
                transports: ['websocket'],
                withCredentials: true
            });
            socket.current = s;
            setSocketInstance(s);

            s.on("connect", () => {
                setIsConnected(true);
                s.emit("setup", userinfo);
            });

            // Re-join personal room after reconnection so events resume (Issue §2)
            s.on("reconnect", () => {
                setIsConnected(true);
                s.emit("setup", userinfo);
                console.log("[Socket] Reconnected — re-joined personal room");
            });

            s.on("connect_error", (err) => {
                console.warn("[Socket] Connection error:", err?.message);
                setIsConnected(false);
            });

            s.on("disconnect", () => {
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
