import { Link } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar = () => {
  const { auth } = usePuterStore();
  const { t } = useTranslation();

  return (
    <nav className="navbar">
     <Link to="/">
     <p className="text-2xl font-bold text-gradient">RESUMIND</p>
     </Link>
      <div className="navbar-actions">
        <LanguageSwitcher />
        {auth.isAuthenticated && (
          <button 
            className="primary-button w-fit" 
            onClick={auth.signOut}
          >
            {t('common.logOut')}
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;