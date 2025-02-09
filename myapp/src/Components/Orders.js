import React, { useState, useEffect } from 'react';
import './Orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');

    // Fetch all orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('http://localhost:555/orders', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }

                const data = await response.json();
                setOrders(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchOrders();
    }, []);

    return (
        <div className="orders-container">
            <h2>Your Orders</h2>
            {error && <p className="error-message">{error}</p>}
            {orders.length === 0 ? (
                <p>You have no orders yet.</p>
            ) : (
                <div>
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Total Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.ORDER_ID}>
                                    <td>{order.ORDER_ID}</td>
                                    <td>{new Date(order.DATE).toLocaleDateString()}</td>
                                    <td>{order.STATUS}</td>
                                    <td>${(order.TOTAL_PRICE || 0).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Orders;
