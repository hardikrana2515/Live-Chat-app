import { useContext } from 'react';
import userContext from '../contexts/UserContext/userContext';
import { TbLogout2 } from 'react-icons/tb';

const Logout = () => {
  const { setLogoutModal } = useContext(userContext);

  const handleClick = () => {
    // Also close the sidebar drawer on mobile if open
    const drawer = document.getElementById('my-drawer');
    if (drawer) drawer.checked = false;
    setLogoutModal(true);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center justify-center sm:justify-start gap-2.5 px-3 py-2 bg-[var(--c-panel)] text-[var(--c-text-2)] hover:text-[var(--c-danger)] hover:bg-[var(--c-danger-10)] border border-[var(--c-line-50)] hover:border-[var(--c-danger-40)] rounded-xl cursor-pointer transition-all duration-200 w-full group text-left"
      aria-label="Logout from Talkyy"
    >
      <TbLogout2 className="text-xl text-[var(--c-text-3)] group-hover:text-[var(--c-danger)] transition-colors" />
      <span className="text-sm font-semibold">Logout</span>
    </button>
  );
};

export default Logout;