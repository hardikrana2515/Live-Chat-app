import React, { useState } from 'react';
import API from '../contexts/Api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await API.post("/user/password/forgot", { email });
            toast.success(res.data.message);
            // Optionally navigate back to login or stay here
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 pt-6 rounded-2xl shadow-xl hover:shadow-2xl shadow-fuchsia-500/50 backdrop-blur-xl bg-gray-900/60 border border-gray-700">
                <h2 className="text-3xl font-bold text-center text-white mb-6">Forgot Password</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col">
                        <label className="text-sm text-gray-300 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="px-4 py-2 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-fuchsia-500 outline-none border border-gray-700 h-12"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 mt-4 text-white font-semibold rounded-lg bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 transition-all transform active:scale-95 disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>

                    <button
                        onClick={() => navigate('/login')}
                        className="text-sm text-gray-400 hover:text-white text-center mt-2 underline"
                    >
                        Back to Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
