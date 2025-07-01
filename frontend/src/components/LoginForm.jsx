import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useContext } from 'react'
import userContext from '../contexts/UserContext/userContext'
import { useNavigate } from 'react-router-dom'

const LoginForm = () => {

    const Navigate = useNavigate()
    const { LoginFunc, setLogin, setError, error } = useContext(userContext)


    const [credentials, setCredentials] = useState({
        phone: '',
        email: '',
        password: ''
    })

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.id]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await LoginFunc(
                credentials.email,
                credentials.phone,
                credentials.password
            )
            setError("")
            setLogin(true);
            if (setLogin) {
                Navigate("/")
            }

        } catch (e) {
            setError(e.message);
        }
    }
    return (
        <div className="flex items-center justify-center min-h-screen w-full px-4 sm:px-6 lg:px-8 bg-transparent">
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-2xl shadow-fuchsia-800 backdrop-blur-xl"
            >
                <h2 className="text-3xl font-poppins font-bold text-gray-800 dark:text-white text-center mb-4">
                    Login
                </h2>

                {error && (
                    <div role="alert" className="alert alert-error alert-outline text-sm">
                        <span>{error}</span>
                    </div>
                )}

                {/* Email */}
                <div className="flex flex-col">
                    <label className="text-sm text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={credentials.email}
                        placeholder="mail@site.com"
                        onChange={handleChange}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                    />
                    <span className="text-xs text-gray-500 mt-1">Enter valid email address</span>
                </div>

                <div className="text-center text-gray-500 dark:text-gray-400 text-sm">or</div>

                {/* Phone */}
                <div className="flex flex-col">
                    <label className="text-sm text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                    <input
                        type="tel"
                        pattern="[0-9]{10}"
                        id="phone"
                        value={credentials.phone}
                        maxLength="10"
                        placeholder="Phone number"
                        onChange={handleChange}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                    />
                    <span className="text-xs text-gray-500 mt-1">Must be 10 digits</span>
                </div>

                {/* Password */}
                <div className="flex flex-col">
                    <label className="text-sm text-gray-700 dark:text-gray-300 mb-1">Password</label>
                    <input
                        type="password"
                        required
                        minLength="8"
                        id="password"
                        value={credentials.password}
                        pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                        placeholder="Password"
                        onChange={handleChange}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                    />
                    <span className="text-xs text-gray-500 mt-1">
                        Must be more than 8 characters,<br />
                        with at least 1 number, lowercase, and uppercase
                    </span>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="mt-4 w-full px-6 py-2 bg-fuchsia-600 text-white font-semibold rounded-lg hover:bg-fuchsia-700 transition-all duration-300"
                >
                    Login
                </button>

                {/* Switch to Signup */}
                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Don't have an account?
                        <span
                            className="ml-1 text-fuchsia-600 font-semibold hover:underline cursor-pointer"
                            onClick={() => setLogin(false)}
                        >
                            Sign Up
                        </span>
                    </p>
                </div>
            </form>
        </div>


    )
}

export default LoginForm