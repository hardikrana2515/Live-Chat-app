
import { GiHamburgerMenu } from "react-icons/gi"
import { MdOutlineArrowBack } from "react-icons/md";
import 'react-toastify/dist/ReactToastify.css';
import userContext from '../contexts/UserContext/userContext';
import { useContext, useEffect } from "react";
import { IoMdSettings } from "react-icons/io";
import { TiGroup } from "react-icons/ti";
import Profile from './Profile';
import Search from './Search';
import Logout from './Logout';
import chatContext from "../contexts/ChatContext/chatcontext";
import Chat from "./Chat";

const Sidebar = () => {
  const { setGroupchat } = useContext(chatContext)
  const { setpass, pass } = useContext(userContext)
  const { Allchat } = useContext(chatContext);

  useEffect(() => {
    Allchat()
  }, [])
  return (
 <div className="w-full h-full bg-gray-900 p-4 flex flex-col gap-4">

  {/* Top Row: Hamburger + Search */}
  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full">

    {/* Hamburger Drawer */}
    <div className="flex-shrink-0">
      <div className="drawer">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <label
            htmlFor="my-drawer"
            className="btn btn-sm btn-primary rounded-full drawer-button"
          >
            <GiHamburgerMenu className="text-lg" />
          </label>
        </div>

        {/* Drawer Side Menu */}
        <div className="drawer-side z-50">
          <label htmlFor="my-drawer" className="drawer-overlay"></label>
          <ul className="menu gap-2 p-4 w-64 min-h-full bg-base-200 text-base-content space-y-2">
            <Profile />

            <div
              onClick={() => {
                setGroupchat(true);
                document.getElementById('my-drawer').checked = false;
              }}
              className="flex items-center gap-2 p-4 rounded-md hover:bg-gray-800 cursor-pointer text-lg transition-all duration-200"
            >
              <TiGroup className="text-xl" /> Create Group
            </div>

            <div
              onClick={() => {
                setpass(true);
                document.getElementById('my-drawer').checked = false;
              }}
              className="flex items-center gap-2 p-4 rounded-md hover:bg-gray-800 cursor-pointer text-lg transition-all duration-200"
            >
              <IoMdSettings className="text-xl" /> Change Password
            </div>

            <Logout />
          </ul>
        </div>
      </div>
    </div>

    {/* Search Box */}
    <div className="flex-grow w-full">
      <Search />
    </div>
  </div>

  {/* Chat List */}
  <div className="flex-1 overflow-y-auto">
    <Chat />
  </div>
</div>


  );
};

export default Sidebar;