import React from 'react'
import { IoCloseSharp } from "react-icons/io5";
import userContext from '../contexts/UserContext/userContext';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import UpdatePassword from '../components/UpdatePassword'

const Account = () => {
  const { setCard, user, GetUser, UploadImg } = useContext(userContext)
  const [img, setImg] = useState(null)

  const handleImage = async (e) => {
    e.preventDefault();
    if (!img) {
      toast.call("No image selected!");
      return;
    }
    await GetUser();
    const formData = new FormData();
    formData.append('profilePic', img);
    try {
      await UploadImg(formData)
      await GetUser()
      toast.success("Profile picture updated!");
    } catch (e) { toast.error(e.message) }
    e.target.reset();
    setImg(null);
  }
  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 backdrop-blur-xl px-4 transition-all duration-300 ease-in-out">
      <div className="bg-white dark:bg-gray-900 text-black dark:text-white w-full max-w-lg rounded-2xl p-6 relative shadow-2xl animate-fadeIn border border-gray-300 dark:border-gray-700">

        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-red-500 transition-transform hover:scale-110"
          onClick={() => setCard(false)}
        >
          <IoCloseSharp />
        </button>

        {/* Header */}
        <h2 className="text-3xl font-bold mb-6 text-center text-fuchsia-600 dark:text-fuchsia-400 border-b border-gray-300 dark:border-gray-700 pb-3">
          My Account
        </h2>

        {/* Avatar */}
        <div className="flex justify-center mb-5">
          <img
            src={user.avtar?.startsWith('data:image') ? user.avtar : `http://localhost:4000${user.avtar}`}
            alt={user?.userName}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-amber-400 object-cover shadow-md"
          />
        </div>

        {/* Upload Section */}
        <div className="flex justify-center mb-6">
          <form
            className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs"
            onSubmit={handleImage}
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImg(e.target.files[0])}
              className="file-input file-input-bordered file-input-sm w-full dark:bg-gray-800 dark:text-white"
            />
            <button
              type="submit"
              className="rounded-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold py-2 px-5 w-full sm:w-auto shadow-md transition-all duration-200"
            >
              Update Pic
            </button>
          </form>
        </div>

        {/* Details */}
        <div className="space-y-3 text-center">
          <p className="text-lg font-semibold text-gray-800 dark:text-white">
            Welcome {user?.gender === 'male' ? 'Mr.' : 'Mrs.'} {user?.name}
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Username: <span className="font-semibold text-gray-800 dark:text-gray-200">{user?.userName}</span>
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Email: <span className="font-semibold text-gray-800 dark:text-gray-200">{user?.email}</span>
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Phone: <span className="font-semibold text-gray-800 dark:text-gray-200">{user?.phonenumber}</span>
          </p>
        </div>
      </div>
    </div>


  )
}

export default Account