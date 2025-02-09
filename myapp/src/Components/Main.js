import { useState, useEffect } from "react";
import Home from "./Home";
import NavBar from "./NavBar";
import LoginForm from './LoginForm';
import RegistrationForm from './Registrationform';
import ProductList from "./ProductList";
import Cart from "./Cart";
import Orders from "./Orders";

const Main = () => {
    const [page, setPage] = useState('home');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:555/products');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchProducts();
    }, []);


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

    const placeOrder = async () => {
        try {
            const response = await fetch('http://localhost:555/order', {
                method: 'POST',
                credentials: 'include', // Include cookies for authentication
            });

            if (!response.ok) {
                throw new Error('Failed to place order');
            }

            alert('Order placed successfully!');
        } catch (err) {
            alert(err.message);
        }
    };


    let currentPage;
    if (page === 'home') currentPage = <Home />;
    else if (page === 'login') currentPage = <LoginForm navigate={setPage} onLogin={handleLogin} />;
    else if (page === 'register') currentPage = <RegistrationForm />;
    else if (page === 'cart') currentPage = <Cart />
    else if (page === 'orders') currentPage = <Orders />
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
            <div className="home-container">
                <h2>Available Products</h2>
                {error && <p className="error-message">{error}</p>}
                <ProductList products={products} placeOrder={placeOrder} />
            </div>
        </div>
    );
};

export default Main;
