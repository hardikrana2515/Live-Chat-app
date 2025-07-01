import React, { useState } from 'react'
import { useContext } from 'react'
import userContext from '../contexts/UserContext/userContext'

const SignUp = () => {
    const { setLogin, signup, setError, error } = useContext(userContext)

    const [credentials, setCredentials] = useState({
        email: '',
        phone: '',
        name: '',
        username: '',
        password: '',
        cpassword: '',
        gender: ''
    })

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.id]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (credentials.password !== credentials.cpassword) {
            setError("Passwords do not match");
            return;
        }
        try {
            await signup(
                credentials.name,
                credentials.gender,
                credentials.username,
                credentials.phone,
                credentials.email,
                credentials.password
            )
            setError("");
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 bg-transparent">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-2xl p-6 sm:p-8 space-y-6 rounded-2xl shadow-2xl shadow-fuchsia-800 backdrop-blur-xl"
            >
                <h2 className="text-3xl font-poppins font-bold text-center text-gray-800 dark:text-white">
                    Create Account
                </h2>

                {error && (
                    <div role="alert" className="alert alert-error alert-outline text-sm">
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            placeholder="Your Name"
                            id="name"
                            onChange={handleChange}
                            value={credentials.name}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-fuchsia-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Username</label>
                        <input
                            type="text"
                            required
                            placeholder="@username"
                            id="username"
                            onChange={handleChange}
                            value={credentials.username}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-fuchsia-500"
                        />
                    </div>
                </div>

                <div className="flex flex-col">
                    <label className="text-sm text-gray-700 dark:text-gray-300 mb-2">Gender</label>
                    <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                            <input
                                type="radio"
                                name="gender"
                                id="gender"
                                value="male"
                                checked={credentials.gender === "male"}
                                onChange={handleChange}
                                required
                                className="accent-fuchsia-600 size-4"
                            />
                            Male
                        </label>
                        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                            <input
                                type="radio"
                                name="gender"
                                id="gender"
                                value="female"
                                checked={credentials.gender === "female"}
                                onChange={handleChange}
                                required
                                className="accent-fuchsia-600 size-4"
                            />
                            Female
                        </label>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            placeholder="you@example.com"
                            id="email"
                            value={credentials.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-fuchsia-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                        <input
                            type="tel"
                            required
                            pattern="[0-9]{10}"
                            maxLength="10"
                            placeholder="10-digit number"
                            id="phone"
                            onChange={handleChange}
                            value={credentials.phone}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-fuchsia-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            minLength="6"
                            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                            placeholder="********"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-fuchsia-500"
                        />
                        <span className="text-[10px] text-red-600">
                            Must be more than 8 characters, with at least 1 number, lowercase, and uppercase
                        </span>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            required
                            id="cpassword"
                            value={credentials.cpassword}
                            onChange={handleChange}
                            minLength="6"
                            placeholder="********"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-fuchsia-500"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full py-3 mt-4 bg-fuchsia-600 text-white font-semibold rounded-lg hover:bg-fuchsia-700 transition"
                >
                    Sign Up
                </button>

                <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?
                        <span
                            className="text-fuchsia-600 font-semibold hover:underline ml-1 cursor-pointer"
                            onClick={() => setLogin(true)}
                        >
                            Log in
                        </span>
                    </p>
                </div>
            </form>
        </div>



    );
}

export default SignUp