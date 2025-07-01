import { useContext, useEffect, useRef } from 'react'
import SocketContext from './socket.Context';
import io from 'socket.io-client'

const SocketStates = ({ children, ENDPOINT, user }) => {
    const socket = useRef();

    useEffect(() => {
        const userinfo = JSON.parse(localStorage.getItem("userInfo"));

        if (!userinfo) return;

        if (!socket.current) {
            socket.current = io(ENDPOINT, {
                transports: ['websocket'],
                withCredentials: true
            });
            socket.current.emit("setup", userinfo);
        }
        return () => {
            if (socket.current) socket.current.disconnect();
        };
    }, [user, ENDPOINT]);


    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}

export default SocketStates
