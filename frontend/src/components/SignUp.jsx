import React, { useState, useContext } from 'react';
import userContext from '../contexts/UserContext/userContext';
import { FiUser, FiAtSign, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiArrowRight, FiAlertCircle } from 'react-icons/fi';

const SignUp = () => {
    const { setLogin, signup, setError, error } = useContext(userContext);

    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [credentials, setCredentials] = useState({
        email: '',
        phone: '',
        name: '',
        username: '',
        password: '',
        cpassword: '',
        gender: 'male'
    });

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.id || e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (credentials.password !== credentials.cpassword) {
            setError('Passwords do not match');
            return;
        }

        // Mirrors the backend rule (min 8 characters) for instant feedback
        if (credentials.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setSubmitting(true);
        try {
            await signup(
                credentials.name,
                credentials.gender,
                credentials.username,
                credentials.phone,
                credentials.email,
                credentials.password
            );
            setError('');
        } catch (err) {
            setError(err.message || 'Signup failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 w-full">
            {error && (
                <div className="flex items-center gap-2 p-2.5 text-xs sm:text-sm text-[var(--c-danger)] bg-[var(--c-danger-10)] border border-[var(--c-danger-40)] rounded-xl backdrop-blur-md animate-fadeIn">
                    <FiAlertCircle className="shrink-0 text-[var(--c-danger)] text-base" />
                    <span>{error}</span>
                </div>
            )}

            {/* Name & Username Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[var(--c-text-2)]">Full Name</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-3 text-[var(--c-text-3)] pointer-events-none">
                            <FiUser className="text-sm" />
                        </span>
                        <input
                            type="text"
                            id="name"
                            required
                            value={credentials.name}
                            onChange={handleChange}
                            placeholder="Alex Morgan"
                            className="w-full pl-9 pr-3 py-2 bg-[var(--c-canvas-80)] border border-[var(--c-line)] rounded-xl text-[var(--c-text)] text-xs sm:text-sm  focus:outline-none focus:border-[var(--c-primary)] focus:ring-1 focus:ring-[var(--c-primary)] transition-all"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[var(--c-text-2)]">Username</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-3 text-[var(--c-text-3)] pointer-events-none">
                            <FiAtSign className="text-sm" />
                        </span>
                        <input
                            type="text"
                            id="username"
                            required
                            value={credentials.username}
                            onChange={handleChange}
                            placeholder="alexmorgan"
                            className="w-full pl-9 pr-3 py-2 bg-[var(--c-canvas-80)] border border-[var(--c-line)] rounded-xl text-[var(--c-text)] text-xs sm:text-sm  focus:outline-none focus:border-[var(--c-primary)] focus:ring-1 focus:ring-[var(--c-primary)] transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[var(--c-text-2)]">Email Address</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-3 text-[var(--c-text-3)] pointer-events-none">
                            <FiMail className="text-sm" />
                        </span>
                        <input
                            type="email"
                            id="email"
                            required
                            value={credentials.email}
                            onChange={handleChange}
                            placeholder="alex@company.com"
                            className="w-full pl-9 pr-3 py-2 bg-[var(--c-canvas-80)] border border-[var(--c-line)] rounded-xl text-[var(--c-text)] text-xs sm:text-sm  focus:outline-none focus:border-[var(--c-primary)] focus:ring-1 focus:ring-[var(--c-primary)] transition-all"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[var(--c-text-2)]">Phone</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-3 text-[var(--c-text-3)] pointer-events-none">
                            <FiPhone className="text-sm" />
                        </span>
                        <input
                            type="tel"
                            id="phone"
                            required
                            pattern="[0-9]{10}"
                            maxLength="10"
                            value={credentials.phone}
                            onChange={handleChange}
                            placeholder="10-digit number"
                            className="w-full pl-9 pr-3 py-2 bg-[var(--c-canvas-80)] border border-[var(--c-line)] rounded-xl text-[var(--c-text)] text-xs sm:text-sm  focus:outline-none focus:border-[var(--c-primary)] focus:ring-1 focus:ring-[var(--c-primary)] transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Gender Selection */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[var(--c-text-2)]">Gender</label>
                <div className="grid grid-cols-2 gap-3">
                    <label
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border cursor-pointer transition-all focus-within:ring-2 focus-within:ring-[var(--ring-brand)] focus-within:border-[var(--c-primary)] ${
                            credentials.gender === 'male'
                                ? 'bg-[var(--c-primary)]/20 border-[var(--c-primary)] text-[var(--c-text)] font-medium shadow-sm'
                                : 'bg-[var(--c-canvas-80)] border-[var(--c-line)] text-[var(--c-text-2)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface)]/40'
                        }`}
                    >
                        <input
                            type="radio"
                            name="gender"
                            value="male"
                            checked={credentials.gender === 'male'}
                            onChange={handleChange}
                            className="sr-only"
                        />
                        <span className="text-xs">Male</span>
                    </label>

                    <label
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border cursor-pointer transition-all focus-within:ring-2 focus-within:ring-[var(--ring-brand)] focus-within:border-[var(--c-primary)] ${
                            credentials.gender === 'female'
                                ? 'bg-[var(--c-primary)]/20 border-[var(--c-primary)] text-[var(--c-text)] font-medium shadow-sm'
                                : 'bg-[var(--c-canvas-80)] border-[var(--c-line)] text-[var(--c-text-2)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface)]/40'
                        }`}
                    >
                        <input
                            type="radio"
                            name="gender"
                            value="female"
                            checked={credentials.gender === 'female'}
                            onChange={handleChange}
                            className="sr-only"
                        />
                        <span className="text-xs">Female</span>
                    </label>
                </div>
            </div>

            {/* Password & Confirm Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[var(--c-text-2)]">Password</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-3 text-[var(--c-text-3)] pointer-events-none">
                            <FiLock className="text-sm" />
                        </span>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            required
                            minLength="6"
                            value={credentials.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full pl-9 pr-9 py-2 bg-[var(--c-canvas-80)] border border-[var(--c-line)] rounded-xl text-[var(--c-text)] text-xs sm:text-sm  focus:outline-none focus:border-[var(--c-primary)] focus:ring-1 focus:ring-[var(--c-primary)] transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 text-[var(--c-text-2)] hover:text-[var(--c-text)] transition-colors focus:outline-none"
                        >
                            {showPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[var(--c-text-2)]">Confirm Password</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-3 text-[var(--c-text-3)] pointer-events-none">
                            <FiLock className="text-sm" />
                        </span>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="cpassword"
                            required
                            minLength="6"
                            value={credentials.cpassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full pl-9 pr-3 py-2 bg-[var(--c-canvas-80)] border border-[var(--c-line)] rounded-xl text-[var(--c-text)] text-xs sm:text-sm  focus:outline-none focus:border-[var(--c-primary)] focus:ring-1 focus:ring-[var(--c-primary)] transition-all"
                        />
                    </div>
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
                        <span>Create Account</span>
                        <FiArrowRight className="text-base" />
                    </>
                )}
            </button>

            {/* Toggle Switch to Login */}
            <div className="text-center mt-1 pt-2 border-t border-[var(--c-line)]">
                <p className="text-xs text-[var(--c-text-2)]">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={() => {
                            setError('');
                            setLogin(true);
                        }}
                        className="text-[var(--c-link)] font-semibold hover:text-[var(--c-link)] hover:underline transition-colors ml-1"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </form>
    );
};

export default SignUp;