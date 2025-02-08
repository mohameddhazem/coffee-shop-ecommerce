import { useState } from "react";
import Home from "./Home";
import NavBar from "./NavBar";
import LoginForm from './LoginForm';
import RegistrationForm from './Registrationform';

const Main = () => {
    const [page, setPage] = useState('home');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const handleLogin = (userData) => {
        console.log('handleLogin called with:', userData);
        localStorage.setItem('authToken', userData.token); // Save token in localStorage
        setIsLoggedIn(true); // Update logged-in state
        setIsAdmin(userData.admin === 1); // Set admin state based on user data
        setPage(userData.admin === 1 ? 'admin-home' : 'home'); // Redirect to admin or home
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken'); // Clear token
        setIsLoggedIn(false);
        setIsAdmin(false);
        setPage('home'); // Redirect to home
        alert('Logged out successfully!');
    };

    let currentPage;
    if (page === 'home') currentPage = <Home />;
    else if (page === 'login') currentPage = <LoginForm navigate={setPage} onLogin={handleLogin} />;
    else if (page === 'register') currentPage = <RegistrationForm />;
    else if (page === 'admin-home') currentPage = <div>Welcome, Admin! (Admin Home Page)</div>;
    else currentPage = <div>Page not found</div>;

    return (
        <div>
            <NavBar
                navigate={setPage}
                isLoggedIn={isLoggedIn}
                isAdmin={isAdmin}
                handleLogout={handleLogout}
            />
            {currentPage}
        </div>
    );
};

export default Main;
