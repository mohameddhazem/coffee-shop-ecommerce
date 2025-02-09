import React, { useEffect, useState } from 'react';
import './Cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [error, setError] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);


    useEffect(() => {
        const fetchCart = async () => {
            try {
                const response = await fetch('http://localhost:555/cart', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch cart items');
                }

                const data = await response.json();
                console.log(data);
                setCartItems(data);


                const total = data.reduce((acc, item) => acc + item.TOTAL_PRICE, 0);
                setTotalPrice(total);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchCart();
    }, []);


    const updateQuantity = async (ID, quantity) => {
        try {
            console.log(ID);
            const id = ID;
            const response = await fetch(`http://localhost:555/cart/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantity }),
            });

            if (!response.ok) {
                throw new Error('Failed to update quantity');
            }


            setCartItems((prev) =>
                prev.map((item) =>
                    item.ID === ID ? { ...item, QUANTITY: quantity, TOTAL_PRICE: item.PRICE * quantity } : item
                )
            );


            const total = cartItems.reduce(
                (acc, item) =>
                    item.ID === ID
                        ? acc + item.PRICE * quantity
                        : acc + item.TOTAL_PRICE,
                0
            );
            setTotalPrice(total);
        } catch (err) {
            alert(err.message);
        }
    };


    const removeItem = async (ID) => {
        try {
            const id = ID;
            const response = await fetch(`http://localhost:555/cart/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to remove item');
            }


            setCartItems((prev) => prev.filter((item) => item.ID !== ID));

            const total = cartItems
                .filter((item) => item.ID !== ID)
                .reduce((acc, item) => acc + item.TOTAL_PRICE, 0);
            setTotalPrice(total);
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="cart-container">
            <h2>Your Cart</h2>
            {error && <p className="error-message">{error}</p>}
            {cartItems.length === 0 ? (
                <p>Your cart is empty</p>
            ) : (
                <div>
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Total</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.map((item) => (
                                <tr key={item.ID}>
                                    <td>{item.NAME}</td>
                                    <td>${item.PRICE}</td>
                                    <td>
                                        <input
                                            type="number"
                                            value={item.QUANTITY}
                                            min="1"
                                            onChange={(e) => updateQuantity(item.ID, parseInt(e.target.value))}
                                        />
                                    </td>
                                    <td>${item.TOTAL_PRICE}</td>
                                    <td>
                                        <button onClick={() => removeItem(item.ID)}>Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <h3>Total Price: ${totalPrice}</h3>
                </div>
            )}
        </div>
    );
};

export default Cart;
