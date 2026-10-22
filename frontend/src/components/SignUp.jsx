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
                <div className="flex items-center gap-2.5 p-3 text-xs sm:text-sm text-[#991B1B] bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl animate-fadeIn">
                    <FiAlertCircle className="shrink-0 text-[#DC2626] text-base" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {/* Name & Username Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[var(--c-primary-ink)]">Full Name</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-3 text-[#7A7D85] pointer-events-none">
                            <FiUser className="text-sm" />
                        </span>
                        <input
                            type="text"
                            id="name"
                            required
                            value={credentials.name}
                            onChange={handleChange}
                            placeholder="Alex Morgan"
                            className="w-full pl-9 pr-3 py-2 bg-[#FAFAF7] hover:bg-white focus:bg-white border border-[var(--c-divider)] rounded-xl text-[var(--c-primary-ink)] text-xs sm:text-sm placeholder:text-[#8D9099] focus:outline-none focus:border-[#2858E8] focus:ring-2 focus:ring-[#2858E8]/15 transition-all"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[var(--c-primary-ink)]">Username</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-3 text-[#7A7D85] pointer-events-none">
                            <FiAtSign className="text-sm" />
                        </span>
                        <input
                            type="text"
                            id="username"
                            required
                            value={credentials.username}
                            onChange={handleChange}
                            placeholder="alex_m"
                            className="w-full pl-9 pr-3 py-2 bg-[#FAFAF7] hover:bg-white focus:bg-white border border-[var(--c-divider)] rounded-xl text-[var(--c-primary-ink)] text-xs sm:text-sm placeholder:text-[#8D9099] focus:outline-none focus:border-[#2858E8] focus:ring-2 focus:ring-[#2858E8]/15 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[var(--c-primary-ink)]">Email Address</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-3 text-[#7A7D85] pointer-events-none">
                            <FiMail className="text-sm" />
                        </span>
                        <input
                            type="email"
                            id="email"
                            required
                            value={credentials.email}
                            onChange={handleChange}
                            placeholder="alex@work.com"
                            className="w-full pl-9 pr-3 py-2 bg-[#FAFAF7] hover:bg-white focus:bg-white border border-[var(--c-divider)] rounded-xl text-[var(--c-primary-ink)] text-xs sm:text-sm placeholder:text-[#8D9099] focus:outline-none focus:border-[#2858E8] focus:ring-2 focus:ring-[#2858E8]/15 transition-all"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[var(--c-primary-ink)]">Phone</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-3 text-[#7A7D85] pointer-events-none">
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
                            placeholder="10-digit mobile"
                            className="w-full pl-9 pr-3 py-2 bg-[#FAFAF7] hover:bg-white focus:bg-white border border-[var(--c-divider)] rounded-xl text-[var(--c-primary-ink)] text-xs sm:text-sm placeholder:text-[#8D9099] focus:outline-none focus:border-[#2858E8] focus:ring-2 focus:ring-[#2858E8]/15 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Gender Selection */}
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[var(--c-primary-ink)]">Gender</label>
                <div className="grid grid-cols-2 gap-3">
                    <label
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border cursor-pointer transition-all ${
                            credentials.gender === 'male'
                                ? 'bg-[var(--c-soft-blue-surface)] border-[#2858E8] text-[#2858E8] font-semibold shadow-2xs'
                                : 'bg-[#FAFAF7] border-[var(--c-divider)] text-[var(--c-secondary-ink)] hover:text-[var(--c-primary-ink)] hover:bg-white'
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
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border cursor-pointer transition-all ${
                            credentials.gender === 'female'
                                ? 'bg-[var(--c-soft-blue-surface)] border-[#2858E8] text-[#2858E8] font-semibold shadow-2xs'
                                : 'bg-[#FAFAF7] border-[var(--c-divider)] text-[var(--c-secondary-ink)] hover:text-[var(--c-primary-ink)] hover:bg-white'
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
                    <label className="text-xs font-semibold text-[var(--c-primary-ink)]">Password</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-3 text-[#7A7D85] pointer-events-none">
                            <FiLock className="text-sm" />
                        </span>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            required
                            minLength="8"
                            value={credentials.password}
                            onChange={handleChange}
                            placeholder="At least 8 chars"
                            className="w-full pl-9 pr-9 py-2 bg-[#FAFAF7] hover:bg-white focus:bg-white border border-[var(--c-divider)] rounded-xl text-[var(--c-primary-ink)] text-xs sm:text-sm placeholder:text-[#8D9099] focus:outline-none focus:border-[#2858E8] focus:ring-2 focus:ring-[#2858E8]/15 transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 text-[#7A7D85] hover:text-[var(--c-primary-ink)] transition-colors focus:outline-none cursor-pointer"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[var(--c-primary-ink)]">Confirm Password</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-3 text-[#7A7D85] pointer-events-none">
                            <FiLock className="text-sm" />
                        </span>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="cpassword"
                            required
                            minLength="8"
                            value={credentials.cpassword}
                            onChange={handleChange}
                            placeholder="Re-enter password"
                            className="w-full pl-9 pr-3 py-2 bg-[#FAFAF7] hover:bg-white focus:bg-white border border-[var(--c-divider)] rounded-xl text-[var(--c-primary-ink)] text-xs sm:text-sm placeholder:text-[#8D9099] focus:outline-none focus:border-[#2858E8] focus:ring-2 focus:ring-[#2858E8]/15 transition-all"
                        />
                    </div>
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
                        <span>Create Account</span>
                        <FiArrowRight className="text-base" />
                    </>
                )}
            </button>

            {/* Toggle Switch to Login */}
            <div className="text-center mt-1 pt-3 border-t border-[var(--c-divider)]">
                <p className="text-xs text-[var(--c-secondary-ink)]">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={() => {
                            setError('');
                            setLogin(true);
                        }}
                        className="text-[#2858E8] font-semibold hover:text-[#173BB5] hover:underline transition-colors ml-1 cursor-pointer"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </form>
    );
};

export default SignUp;