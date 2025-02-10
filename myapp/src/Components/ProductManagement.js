import React, { useEffect, useState } from 'react';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '', image: '' });
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    // Fetch all products
    useEffect(() => {
        const fetchProducts = async () => {
            const response = await fetch('http://localhost:555/products');
            const data = await response.json();
            setProducts(data);
        };
        fetchProducts();
    }, []);

    // Add or update product
    const handleSubmit = async () => {
        const url = editMode
            ? `http://localhost:555/product/${editId}`
            : 'http://localhost:555/product';
        const method = editMode ? 'PUT' : 'POST';

        await fetch(url, {
            method,
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        setFormData({ name: '', description: '', price: '', stock: '', image: '' });
        setEditMode(false);
        setEditId(null);

        // Refresh products
        const response = await fetch('http://localhost:555/products');
        const data = await response.json();
        setProducts(data);
    };

    // Delete product
    const handleDelete = async (id) => {
        await fetch(`http://localhost:555/product/${id}`, {
            method: 'DELETE',
            credentials: "include"
        });

        // Refresh products
        const response = await fetch('http://localhost:555/products');
        const data = await response.json();
        setProducts(data);
    };

    // Edit product
    const handleEdit = (product) => {
        setFormData(product);
        setEditMode(true);
        setEditId(product.ID);
    };

    return (
        <div className="product-management">
            <h3>Manage Products</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <input
                    type="text"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                />
                <input
                    type="number"
                    placeholder="Price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                />
                <input
                    type="number"
                    placeholder="Stock"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Image URL"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
                <button type="submit">{editMode ? 'Update Product' : 'Add Product'}</button>
            </form>

            <h3>All Products</h3>
            <ul>
                {products.map((product) => (
                    <li key={product.ID}>
                        {product.NAME} - ${product.PRICE} - {product.STOCK} in stock
                        <button onClick={() => handleEdit(product)}>Edit</button>
                        <button onClick={() => handleDelete(product.ID)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProductManagement;
