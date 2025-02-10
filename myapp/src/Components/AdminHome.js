import React, { useState } from 'react';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';

const AdminHome = () => {
    const [view, setView] = useState('products'); // Toggle between products and orders

    return (
        <div className="admin-dashboard">
            <h2>Admin Dashboard</h2>
            <div className="admin-navigation">
                <button onClick={() => setView('products')}>Manage Products</button>
                <button onClick={() => setView('orders')}>View Orders</button>
            </div>
            <div className="admin-content">
                {view === 'products' && <ProductManagement />}
                {view === 'orders' && <OrderManagement />}
            </div>
        </div>
    );
};

export default AdminHome;