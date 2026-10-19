import React, { useState } from 'react';
import API from '../contexts/Api';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }
        setLoading(true);
        try {
            const res = await API.put(`/user/password/reset/${token}`, { password, confirmPassword });
            toast.success(res.data.message);
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 pt-6 rounded-2xl shadow-xl hover:shadow-2xl  backdrop-blur-xl bg-[var(--c-panel-80)] border border-[var(--c-line)]">
                <h2 className="text-3xl font-bold text-center text-[var(--c-text)] mb-6">Reset Password</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col">
                        <label className="text-sm text-[var(--c-text)] mb-1">New Password</label>
                        <input
                            type="password"
                            required
                            minLength="8"
                            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                            title="Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="px-4 py-2 rounded-lg bg-[var(--c-surface)] text-[var(--c-text)] focus:ring-2 focus:ring-[var(--c-primary)] outline-none border border-[var(--c-line)]"
                        />
                        <span className="text-xs text-[var(--c-text-3)]">
                            Must be &gt; 8 chars, with 1 number, lowercase, & uppercase.
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm text-[var(--c-text)] mb-1">Confirm Password</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="px-4 py-2 rounded-lg bg-[var(--c-surface)] text-[var(--c-text)] focus:ring-2 focus:ring-[var(--c-primary)] outline-none border border-[var(--c-line)]"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 mt-4 text-[var(--c-text)] font-semibold rounded-lg btn-primary transition-all transform active:scale-95 disabled:opacity-50"
                    >
                        {loading ? "Updating..." : "Update Password"}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
