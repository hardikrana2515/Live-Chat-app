import React, { useState } from 'react';
import API from '../contexts/Api';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiArrowRight, FiShield } from 'react-icons/fi';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await API.post("/user/password/forgot", { email });
            toast.success(res.data.message || "Reset link sent to your email");
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        }
        setLoading(false);
    };

    return (
        <div className="landing-root min-h-screen w-full flex flex-col justify-between bg-[var(--c-warm-paper)] text-[var(--c-primary-ink)] relative overflow-x-hidden selection:bg-[#2858E8]/15 selection:text-[#2858E8]">
            {/* Top Navigation */}
            <header className="w-full border-b border-[var(--c-divider)] bg-[var(--c-warm-paper)]/90 backdrop-blur-md sticky top-0 z-30">
                <div className="max-w-[1240px] mx-auto px-5 h-16 flex items-center justify-between">
                    <Link
                        to="/"
                        className="group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2858E8] rounded-md"
                        aria-label="Talkyy Home"
                    >
                        <img
                            src="/brand/talkyy-horizontal-clean.png"
                            alt="Talkyy"
                            className="h-8 sm:h-9 w-auto max-w-[140px] sm:max-w-[160px] object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                        />
                    </Link>

                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--c-secondary-ink)] hover:text-[var(--c-primary-ink)] px-3.5 py-1.5 rounded-lg border border-[var(--c-divider)] bg-white/70 hover:bg-white transition-all shadow-2xs hover:shadow-xs"
                    >
                        <FiArrowLeft className="text-sm" />
                        <span>Back to Login</span>
                    </Link>
                </div>
            </header>

            {/* Main Area */}
            <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-14 relative z-10">
                <div className="w-full max-w-[440px] mx-auto flex flex-col items-center">
                    <div className="flex flex-col items-center text-center mb-6 w-full">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--c-soft-blue-surface)] px-3 py-1 text-xs font-semibold text-[#2858E8] border border-[#2858E8]/15 mb-3.5 shadow-2xs">
                            <span>Account Recovery</span>
                        </div>
                        <h1 className="font-display text-2xl sm:text-[1.75rem] font-bold text-[var(--c-primary-ink)] tracking-tight">
                            Reset your password
                        </h1>
                        <p className="text-xs sm:text-sm text-[var(--c-secondary-ink)] mt-1.5 max-w-sm leading-relaxed">
                            Enter the email associated with your Talkyy account and we'll send you a secure link to reset your password.
                        </p>
                    </div>

                    <div className="w-full bg-white border border-[var(--c-divider)] rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(25,27,32,0.06)]">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-[var(--c-primary-ink)]">Email Address</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-3.5 text-[#7A7D85] pointer-events-none">
                                        <FiMail className="text-base" />
                                    </span>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@company.com"
                                        className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAF7] hover:bg-white focus:bg-white border border-[var(--c-divider)] rounded-xl text-[var(--c-primary-ink)] text-sm placeholder:text-[#8D9099] focus:outline-none focus:border-[#2858E8] focus:ring-2 focus:ring-[#2858E8]/15 transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-2 w-full h-11 bg-[#2858E8] hover:bg-[#173BB5] active:translate-y-0 hover:-translate-y-0.5 text-white font-semibold text-sm rounded-xl shadow-[0_2px_8px_rgba(40,88,232,0.22)] hover:shadow-[0_4px_14px_rgba(40,88,232,0.3)] flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50 cursor-pointer"
                            >
                                {loading ? (
                                    <span className="loading loading-spinner loading-sm" />
                                ) : (
                                    <>
                                        <span>Send Reset Link</span>
                                        <FiArrowRight className="text-base" />
                                    </>
                                )}
                            </button>

                            <div className="text-center mt-1 pt-3 border-t border-[var(--c-divider)]">
                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="text-xs font-semibold text-[#2858E8] hover:text-[#173BB5] hover:underline transition-colors cursor-pointer"
                                >
                                    Return to Sign in
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 pt-4 border-t border-[var(--c-divider)] flex items-center justify-center gap-1.5 text-xs text-[var(--c-secondary-ink)]">
                            <FiShield className="text-[#2858E8] text-sm shrink-0" />
                            <span>Encrypted recovery token · Expires in 15 minutes</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full border-t border-[var(--c-divider)] py-5 text-center text-xs text-[var(--c-secondary-ink)] bg-[var(--c-warm-paper)]">
                <p>© {new Date().getFullYear()} Talkyy. Good conversations bring us closer.</p>
            </footer>
        </div>
    );
};

export default ForgotPassword;
