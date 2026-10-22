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
            navigate('/chat');
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
            {error && (
                <div className="flex items-center gap-2.5 p-3 text-xs sm:text-sm text-[#991B1B] bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl animate-fadeIn">
                    <FiAlertCircle className="shrink-0 text-[#DC2626] text-base" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {/* Method Switcher: Email / Phone */}
            <div className="flex items-center justify-between text-xs border-b border-[var(--c-divider)] pb-3">
                <span className="font-semibold text-[var(--c-primary-ink)]">Sign in with</span>
                <div className="flex gap-1 p-0.5 bg-[#EFECE4] border border-[var(--c-divider)] rounded-lg">
                    <button
                        type="button"
                        onClick={() => {
                            setAuthMethod('email');
                            setError('');
                        }}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                            authMethod === 'email'
                                ? 'bg-white text-[var(--c-primary-ink)] shadow-2xs border border-[var(--c-divider)]/40'
                                : 'text-[var(--c-secondary-ink)] hover:text-[var(--c-primary-ink)]'
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
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                            authMethod === 'phone'
                                ? 'bg-white text-[var(--c-primary-ink)] shadow-2xs border border-[var(--c-divider)]/40'
                                : 'text-[var(--c-secondary-ink)] hover:text-[var(--c-primary-ink)]'
                        }`}
                    >
                        Phone
                    </button>
                </div>
            </div>

            {/* Email or Phone Input */}
            {authMethod === 'email' ? (
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--c-primary-ink)]">Email Address</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-[#7A7D85] pointer-events-none">
                            <FiMail className="text-base" />
                        </span>
                        <input
                            type="email"
                            id="email"
                            required
                            value={credentials.email}
                            onChange={handleChange}
                            placeholder="name@company.com"
                            className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAF7] hover:bg-white focus:bg-white border border-[var(--c-divider)] rounded-xl text-[var(--c-primary-ink)] text-sm placeholder:text-[#8D9099] focus:outline-none focus:border-[#2858E8] focus:ring-2 focus:ring-[#2858E8]/15 transition-all"
                        />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--c-primary-ink)]">Phone Number</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-[#7A7D85] pointer-events-none">
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
                            className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAF7] hover:bg-white focus:bg-white border border-[var(--c-divider)] rounded-xl text-[var(--c-primary-ink)] text-sm placeholder:text-[#8D9099] focus:outline-none focus:border-[#2858E8] focus:ring-2 focus:ring-[#2858E8]/15 transition-all"
                        />
                    </div>
                </div>
            )}

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[var(--c-primary-ink)]">Password</label>
                    <Link
                        to="/password/forgot"
                        className="text-xs font-semibold text-[#2858E8] hover:text-[#173BB5] hover:underline transition-colors"
                    >
                        Forgot password?
                    </Link>
                </div>
                <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-[#7A7D85] pointer-events-none">
                        <FiLock className="text-base" />
                    </span>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        required
                        value={credentials.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-[#FAFAF7] hover:bg-white focus:bg-white border border-[var(--c-divider)] rounded-xl text-[var(--c-primary-ink)] text-sm placeholder:text-[#8D9099] focus:outline-none focus:border-[#2858E8] focus:ring-2 focus:ring-[#2858E8]/15 transition-all"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-[#7A7D85] hover:text-[var(--c-primary-ink)] transition-colors focus:outline-none cursor-pointer"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                    </button>
                </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full h-11 bg-[#2858E8] hover:bg-[#173BB5] active:translate-y-0 hover:-translate-y-0.5 text-white font-semibold text-sm rounded-xl shadow-[0_2px_8px_rgba(40,88,232,0.22)] hover:shadow-[0_4px_14px_rgba(40,88,232,0.3)] flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50 cursor-pointer"
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
            <div className="text-center mt-1 pt-3 border-t border-[var(--c-divider)]">
                <p className="text-xs text-[var(--c-secondary-ink)]">
                    New to Talkyy?{' '}
                    <button
                        type="button"
                        onClick={() => {
                            setError('');
                            setLogin(false);
                        }}
                        className="text-[#2858E8] font-semibold hover:text-[#173BB5] hover:underline transition-colors ml-1 cursor-pointer"
                    >
                        Create an account
                    </button>
                </p>
            </div>
        </form>
    );
};

export default LoginForm;