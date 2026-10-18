import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import userContext from '../contexts/UserContext/userContext';
import { FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiArrowRight, FiAlertCircle } from 'react-icons/fi';

const LoginForm = () => {
    const navigate = useNavigate();
    const { LoginFunc, setLogin, setError, error } = useContext(userContext);

    const [authMethod, setAuthMethod] = useState('email'); // 'email' | 'phone'
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [credentials, setCredentials] = useState({
        phone: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await LoginFunc(
                authMethod === 'email' ? credentials.email : '',
                authMethod === 'phone' ? credentials.phone : '',
                credentials.password
            );
            navigate('/');
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
            {error && (
                <div className="flex items-center gap-2 p-3 text-xs sm:text-sm text-red-200 bg-red-900/40 border border-red-500/30 rounded-xl backdrop-blur-md animate-fadeIn">
                    <FiAlertCircle className="shrink-0 text-red-400 text-base" />
                    <span>{error}</span>
                </div>
            )}

            {/* Method Switcher: Email / Phone */}
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2.5">
                <span className="font-medium text-slate-400">Sign in with:</span>
                <div className="flex gap-1.5 p-0.5 bg-slate-950/80 border border-slate-800 rounded-lg">
                    <button
                        type="button"
                        onClick={() => {
                            setAuthMethod('email');
                            setError('');
                        }}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                            authMethod === 'email'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        Email
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setAuthMethod('phone');
                            setError('');
                        }}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                            authMethod === 'phone'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        Phone
                    </button>
                </div>
            </div>

            {/* Email or Phone Input */}
            {authMethod === 'email' ? (
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-300">Email Address</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-slate-500 pointer-events-none">
                            <FiMail className="text-base" />
                        </span>
                        <input
                            type="email"
                            id="email"
                            required
                            value={credentials.email}
                            onChange={handleChange}
                            placeholder="name@company.com"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-300">Phone Number</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-slate-500 pointer-events-none">
                            <FiPhone className="text-base" />
                        </span>
                        <input
                            type="tel"
                            id="phone"
                            required
                            pattern="[0-9]{10}"
                            maxLength="10"
                            value={credentials.phone}
                            onChange={handleChange}
                            placeholder="10-digit mobile number"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>
            )}

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">Password</label>
                    <Link
                        to="/password/forgot"
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                        Forgot password?
                    </Link>
                </div>
                <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-slate-500 pointer-events-none">
                        <FiLock className="text-base" />
                    </span>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        required
                        value={credentials.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                    >
                        {showPassword ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                    </button>
                </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all duration-200 transform active:scale-[0.98] disabled:opacity-50"
            >
                {submitting ? (
                    <span className="loading loading-spinner loading-sm" />
                ) : (
                    <>
                        <span>Continue</span>
                        <FiArrowRight className="text-base" />
                    </>
                )}
            </button>

            {/* Toggle Switch to Sign Up */}
            <div className="text-center mt-2 pt-2 border-t border-slate-800">
                <p className="text-xs text-slate-400">
                    New to Talkyy?{' '}
                    <button
                        type="button"
                        onClick={() => {
                            setError('');
                            setLogin(false);
                        }}
                        className="text-indigo-400 font-semibold hover:text-indigo-300 hover:underline transition-colors ml-1"
                    >
                        Create an account
                    </button>
                </p>
            </div>
        </form>
    );
};

export default LoginForm;