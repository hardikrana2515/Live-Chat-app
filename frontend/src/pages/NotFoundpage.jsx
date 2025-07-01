import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundpage = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full h-screen bg-[url('/404.png')] bg-cover bg-center sm:bg-contain sm:bg-no-repeat sm:bg-center">
        </div>

    );
};

export default NotFoundpage;
