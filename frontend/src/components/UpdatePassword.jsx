import { useState, useContext } from 'react';
import userContext from '../contexts/UserContext/userContext';
import { toast } from 'react-toastify';
import { IoCloseSharp } from "react-icons/io5";

const UpdatePassword = () => {
  const { updatePassword, setpass } = useContext(userContext);
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      return toast.error('New and Confirm Password do not match');
    }

    try {
      await updatePassword(form.oldPassword, form.newPassword);
      toast.success('Password updated successfully');
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-5 flex items-center justify-center z-50 backdrop-blur-xl px-4 transition-all duration-300 ease-in-out">
      <div className="bg-white dark:bg-gray-900 text-black dark:text-white w-full max-w-lg rounded-2xl p-6 relative shadow-2xl animate-fadeIn border border-gray-300 dark:border-gray-700">

        {/* Title & Close */}
        <h2 className="text-xl font-semibold text-center mb-4 text-fuchsia-600 dark:text-fuchsia-400">
          Update Password
        </h2>
        <button
          className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-red-500 transition-transform hover:scale-110"
          onClick={() => setpass(false)}
        >
          <IoCloseSharp />
        </button>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Old Password
            </label>
            <input
              type="password"
              name="oldPassword"
              value={form.oldPassword}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-fuchsia-500 focus:border-fuchsia-500 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              required
              minLength="8"
              pattern="(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
              title="Must contain at least one number, one lowercase, one uppercase, and be at least 8 characters"
              className="mt-1 block w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-fuchsia-500 focus:border-fuchsia-500 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-fuchsia-500 focus:border-fuchsia-500 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>

  );
};

export default UpdatePassword;
