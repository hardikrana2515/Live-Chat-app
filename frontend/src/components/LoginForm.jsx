import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import userContext from '../contexts/UserContext/userContext';
import { FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiArrowRight, FiAlertCircle, FiShield, FiKey, FiArrowLeft } from 'react-icons/fi';

const LoginForm = () => {
    const navigate = useNavigate();
    const { LoginFunc, Verify2FALoginFunc, setLogin, setError, error } = useContext(userContext);

    const [authMethod, setAuthMethod] = useState('email'); // 'email' | 'phone'
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [credentials, setCredentials] = useState({
        phone: '',
        email: '',
        password: ''
    });

    // 2FA Challenge State
    const [twoFactorChallenge, setTwoFactorChallenge] = useState(null); // { twoFactorToken, email }
    const [otpCode, setOtpCode] = useState('');
    const [useBackupCode, setUseBackupCode] = useState(false);
    const otpInputRef = useRef(null);

    useEffect(() => {
        if (twoFactorChallenge && otpInputRef.current) {
            otpInputRef.current.focus();
        }
    }, [twoFactorChallenge, useBackupCode]);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const res = await LoginFunc(
                authMethod === 'email' ? credentials.email : '',
                authMethod === 'phone' ? credentials.phone : '',
                credentials.password
            );

            if (res?.data?.requires2FA) {
                // Switch to 2FA challenge step
                setTwoFactorChallenge({
                    twoFactorToken: res.data.twoFactorToken,
                    email: res.data.email
                });
                setOtpCode('');
                setUseBackupCode(false);
            } else {
                navigate('/chat');
            }
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleVerify2FA = async (e) => {
        e.preventDefault();
        if (!otpCode.trim()) {
            setError(useBackupCode ? 'Please enter your backup code' : 'Please enter the 6-digit verification code');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await Verify2FALoginFunc(
                twoFactorChallenge.twoFactorToken,
                otpCode.trim(),
                useBackupCode
            );
            navigate('/chat');
        } catch (err) {
            setError(err.message || 'Verification failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel2FA = () => {
        setTwoFactorChallenge(null);
        setOtpCode('');
        setUseBackupCode(false);
        setError('');
    };

    // If 2FA is required, show the 2FA verification challenge card
    if (twoFactorChallenge) {
        return (
            <form onSubmit={handleVerify2FA} className="flex flex-col gap-4 w-full animate-fadeIn">
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-[var(--c-canvas-80,#F8FAFC)] border border-[#2858E8]/20">
                    <div className="w-12 h-12 rounded-2xl bg-[#2858E8]/10 text-[#2858E8] flex items-center justify-center mb-2 shadow-inner">
                        {useBackupCode ? <FiKey className="text-2xl" /> : <FiShield className="text-2xl" />}
                    </div>
                    <h3 className="text-base font-bold text-[var(--c-primary-ink)]">
                        {useBackupCode ? 'Emergency Backup Code' : 'Two-Factor Verification'}
                    </h3>
                    <p className="text-xs text-[var(--c-secondary-ink)] mt-1 max-w-xs">
                        {useBackupCode
                            ? 'Enter one of your 8-character emergency backup codes (e.g. A1B2-C3D4).'
                            : `Enter the 6-digit code from your Authenticator app for ${twoFactorChallenge.email || 'your account'}.`}
                    </p>
                </div>

                {error && (
                    <div className="flex items-center gap-2.5 p-3 text-xs sm:text-sm text-[#991B1B] bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl animate-fadeIn">
                        <FiAlertCircle className="shrink-0 text-[#DC2626] text-base" />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--c-primary-ink)]">
                        {useBackupCode ? 'Backup Code' : '6-Digit Security Code'}
                    </label>
                    <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-[#7A7D85] pointer-events-none">
                            {useBackupCode ? <FiKey className="text-base" /> : <FiShield className="text-base" />}
                        </span>
                        <input
                            ref={otpInputRef}
                            type="text"
                            required
                            autoFocus
                            autoComplete="one-time-code"
                            maxLength={useBackupCode ? 12 : 6}
                            value={otpCode}
                            onChange={(e) => {
                                const val = e.target.value.toUpperCase();
                                if (useBackupCode) {
                                    setOtpCode(val.replace(/[^A-Z0-9-]/g, ''));
                                } else {
                                    setOtpCode(val.replace(/[^0-9]/g, ''));
                                }
                            }}
                            placeholder={useBackupCode ? 'XXXX-XXXX' : '••••••'}
                            className={`w-full pl-10 pr-4 py-3 bg-[#FAFAF7] hover:bg-white focus:bg-white border border-[var(--c-divider)] rounded-xl text-[var(--c-primary-ink)] text-lg font-mono font-bold focus:outline-none focus:border-[#2858E8] focus:ring-2 focus:ring-[#2858E8]/15 transition-all ${
                                !useBackupCode ? 'tracking-[0.4em] text-center' : 'tracking-widest text-center'
                            }`}
                        />
                    </div>
                </div>

                {/* Submit 2FA Button */}
                <button
                    type="submit"
                    disabled={submitting || (useBackupCode ? otpCode.length < 6 : otpCode.length !== 6)}
                    className="w-full h-11 bg-[#2858E8] hover:bg-[#173BB5] active:translate-y-0 hover:-translate-y-0.5 text-white font-semibold text-sm rounded-xl shadow-[0_2px_8px_rgba(40,88,232,0.22)] hover:shadow-[0_4px_14px_rgba(40,88,232,0.3)] flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50 cursor-pointer"
                >
                    {submitting ? (
                        <span className="loading loading-spinner loading-sm" />
                    ) : (
                        <>
                            <span>Verify & Sign In</span>
                            <FiArrowRight className="text-base" />
                        </>
                    )}
                </button>

                {/* Toggle Backup Code vs Authenticator App */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--c-divider)]">
                    <button
                        type="button"
                        onClick={() => {
                            setUseBackupCode(!useBackupCode);
                            setOtpCode('');
                            setError('');
                        }}
                        className="text-[#2858E8] hover:text-[#173BB5] font-semibold hover:underline transition"
                    >
                        {useBackupCode ? '← Use Authenticator app instead' : 'Lost phone? Use backup code'}
                    </button>

                    <button
                        type="button"
                        onClick={handleCancel2FA}
                        className="text-[var(--c-secondary-ink)] hover:text-[var(--c-primary-ink)] transition"
                    >
                        Back to login
                    </button>
                </div>
            </form>
        );
    }

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
                            placeholder="you@domain.com"
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
                            value={credentials.phone}
                            onChange={handleChange}
                            placeholder="+1234567890"
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
                        to="/forgot-password"
                        className="text-xs text-[#2858E8] hover:text-[#173BB5] font-semibold transition-colors"
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