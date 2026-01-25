import { useContext, useEffect, useRef, useState } from 'react'
import SocketContext from './socket.Context';
import io from 'socket.io-client'

const SocketStates = ({ children, ENDPOINT, user }) => {
    const socket = useRef();
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        const userinfo = JSON.parse(localStorage.getItem("userInfo"));

        if (!userinfo) return;

        if (!socket.current) {
            socket.current = io(ENDPOINT, {
                transports: ['websocket'],
                withCredentials: true
            });
            socket.current.emit("setup", userinfo);

            socket.current.on("getOnlineUsers", (users) => {
                setOnlineUsers(users);
            });
        }

        return () => {
            // In strict mode this might disconnect prematurely if not handled carefully, 
            // but keeping original logic structure.
            // Ideally we shouldn't disconnect on every render if we want persistence, 
            // but user dependency changes it.
            if (socket.current) {
                socket.current.off("getOnlineUsers");
                // socket.current.disconnect(); // Don't disconnect here in development or it flickers
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
