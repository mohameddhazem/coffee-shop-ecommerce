import React from 'react';
import './ProductList.css';

const ProductList = ({ products, placeOrder }) => {
    const addToCart = async (productId) => {
        const authToken = localStorage.getItem('authToken'); // Check for token in localStorage

        if (!authToken) {
            alert('You must sign in first to add items to your cart.');
            return;
        }
        try {
            const response = await fetch('http://localhost:555/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies in the request
                body: JSON.stringify({ productId, quantity: 1 }), // Default quantity to 1
            });

            if (!response.ok) {
                throw new Error('Failed to add product to cart');
            }

            alert('Product added to cart successfully!');
        } catch (error) {
            console.error(error.message);
            alert('Error adding product to cart');
        }
    };


    return (
        <div>
            <div className="place-order">
                <button onClick={placeOrder}>Place Order</button>
            </div>
            <div className="products-grid">
                {products.map((product) => (
                    <div key={product.ID} className="product-card">
                        <img src={`/images/${product.IMAGE || 'placeholder.jpg'}`} alt={product.NAME} className="product-image" />
                        <h3>{product.NAME}</h3>
                        <p>Price: ${product.PRICE}</p>
                        <button onClick={() => addToCart(product.ID)}>Add to Cart</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductList;
