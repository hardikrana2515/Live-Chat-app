import { useContext, useEffect, useRef, useState } from 'react'
import SocketContext from './socket.Context';
import io from 'socket.io-client'
import userContext from '../UserContext/userContext';

const SocketStates = ({ children, ENDPOINT }) => {
    const socket = useRef();
    const [onlineUsers, setOnlineUsers] = useState([]);
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
            return;
        }

        const isUserChanged = prevUserIdRef.current && prevUserIdRef.current !== userinfo._id;
        prevUserIdRef.current = userinfo._id;

        if (socket.current && isUserChanged) {
            socket.current.disconnect();
            socket.current = null;
        }

        if (!socket.current) {
            socket.current = io(ENDPOINT, {
                transports: ['websocket'],
                withCredentials: true
            });

            socket.current.on("connect", () => {
                socket.current.emit("setup", userinfo);
            });
        } else if (socket.current.connected) {
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
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    )
}

export default SocketStates
