import React, { useEffect, useState } from 'react';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            const response = await fetch('http://localhost:555/admin/orders', {
                credentials: 'include',
            });
            const data = await response.json();
            setOrders(data);
        };

        fetchOrders();
    }, []);

    return (
        <div className="order-management">
            <h3>All Orders</h3>
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>User ID</th>
                        <th>Total Price</th>
                        <th>Status</th>
                        <th>Created At</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.ORDER_ID}>
                            <td>{order.ORDER_ID}</td>
                            <td>{order.USER_ID}</td>
                            <td>${order.TOTAL_PRICE.toFixed(2)}</td>
                            <td>{order.STATUS}</td>
                            <td>{new Date(order.CREATED_AT).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderManagement;
