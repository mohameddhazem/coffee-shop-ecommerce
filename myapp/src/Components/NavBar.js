import './NavBar.css';

const NavBar = ({ navigate, isLoggedIn, isAdmin, handleLogout }) => {
    return (
        <nav>
            <div className="logo" onClick={() => navigate('home')}>
                Coffee Shop
            </div>
            <div>
                <ul>
                    {!isLoggedIn ? (
                        <>
                            <li onClick={() => navigate('login')}>Login</li>
                            <li onClick={() => navigate('register')}>Register</li>
                        </>
                    ) : (
                        <>
                            {!isAdmin && <li onClick={() => navigate('cart')}>Cart</li>}
                            {!isAdmin && <li onClick={() => navigate('orders')}>Orders</li>}
                            {isAdmin && <li onClick={() => navigate('admin-home')}>Admin</li>}
                            <li onClick={handleLogout}>Logout</li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default NavBar;
