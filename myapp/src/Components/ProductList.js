import React from 'react';
import './ProductList.css';

const ProductList = ({ products }) => {
    return (
        <div className="products-grid">
            {products.map((product) => (
                <div key={product.ID} className="product-card">
                    <img src={`/images/${product.IMAGE || 'placeholder.jpg'}`} alt={product.NAME} className="product-image" />
                    <h3>{product.NAME}</h3>
                    <p>Price: ${product.PRICE}</p>
                    <button>Add to Cart</button>
                </div>
            ))}
        </div>
    );
};

export default ProductList;
