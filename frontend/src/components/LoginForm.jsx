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
                <div className="flex items-center gap-2 p-3 text-xs sm:text-sm text-[var(--c-danger)] bg-[var(--c-danger-10)] border border-[var(--c-danger-40)] rounded-xl backdrop-blur-md animate-fadeIn">
                    <FiAlertCircle className="shrink-0 text-[var(--c-danger)] text-base" />
                    <span>{error}</span>
                </div>
            )}

            {/* Method Switcher: Email / Phone */}
            <div className="flex items-center justify-between text-xs text-[var(--c-text-2)] border-b border-[var(--c-line)] pb-2.5">
                <span className="font-medium text-[var(--c-text-2)]">Sign in with:</span>
                <div className="flex gap-1.5 p-0.5 bg-[var(--c-canvas-80)] border border-[var(--c-line)] rounded-lg">
                    <button
                        type="button"
                        onClick={() => {
                            setAuthMethod('email');
                            setError('');
                        }}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                            authMethod === 'email'
                                ? 'bg-[var(--c-primary)] text-[var(--c-text)] shadow-sm'
                                : 'text-[var(--c-text-2)] hover:text-[var(--c-text)]'
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
                                ? 'bg-[var(--c-primary)] text-[var(--c-text)] shadow-sm'
                                : 'text-[var(--c-text-2)] hover:text-[var(--c-text)]'
                        }`}
                    >
                        Phone
                    </button>
                </div>
            </div>

            {/* Email or Phone Input */}
            {authMethod === 'email' ? (
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[var(--c-text-2)]">Email Address</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-[var(--c-text-3)] pointer-events-none">
                            <FiMail className="text-base" />
                        </span>
                        <input
                            type="email"
                            id="email"
                            required
                            value={credentials.email}
                            onChange={handleChange}
                            placeholder="name@company.com"
                            className="w-full pl-10 pr-4 py-2.5 bg-[var(--c-canvas-80)] border border-[var(--c-line)] rounded-xl text-[var(--c-text)] text-sm  focus:outline-none focus:border-[var(--c-primary)] focus:ring-1 focus:ring-[var(--c-primary)] transition-all"
                        />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[var(--c-text-2)]">Phone Number</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-[var(--c-text-3)] pointer-events-none">
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
                            className="w-full pl-10 pr-4 py-2.5 bg-[var(--c-canvas-80)] border border-[var(--c-line)] rounded-xl text-[var(--c-text)] text-sm  focus:outline-none focus:border-[var(--c-primary)] focus:ring-1 focus:ring-[var(--c-primary)] transition-all"
                        />
                    </div>
                </div>
            )}

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[var(--c-text-2)]">Password</label>
                    <Link
                        to="/password/forgot"
                        className="text-xs text-[var(--c-link)] hover:text-[var(--c-link)] transition-colors"
                    >
                        Forgot password?
                    </Link>
                </div>
                <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-[var(--c-text-3)] pointer-events-none">
                        <FiLock className="text-base" />
                    </span>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        required
                        value={credentials.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-[var(--c-canvas-80)] border border-[var(--c-line)] rounded-xl text-[var(--c-text)] text-sm  focus:outline-none focus:border-[var(--c-primary)] focus:ring-1 focus:ring-[var(--c-primary)] transition-all"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-[var(--c-text-2)] hover:text-[var(--c-text)] transition-colors focus:outline-none"
                    >
                        {showPassword ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                    </button>
                </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full py-2.5 px-4 bg-[var(--c-primary)] hover:bg-[var(--c-primary-hover)] text-[var(--c-text)] font-medium text-sm rounded-xl shadow-lg  flex items-center justify-center gap-2 transition-all duration-200 transform active:scale-[0.98] disabled:opacity-50"
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
            <div className="text-center mt-2 pt-2 border-t border-[var(--c-line)]">
                <p className="text-xs text-[var(--c-text-2)]">
                    New to Talkyy?{' '}
                    <button
                        type="button"
                        onClick={() => {
                            setError('');
                            setLogin(false);
                        }}
                        className="text-[var(--c-link)] font-semibold hover:text-[var(--c-link)] hover:underline transition-colors ml-1"
                    >
                        Create an account
                    </button>
                </p>
            </div>
        </form>
    );
};

export default LoginForm;