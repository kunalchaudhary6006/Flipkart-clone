import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import ProductDetails from './pages/ProductDetails';
import Account from './pages/Account';
import Login from './pages/Login';
import { CartProvider } from './CartContext';
import { AuthProvider } from './AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="font-sans text-fk-text min-h-screen bg-fk-gray">
            <Header />
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/account" element={<Account />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </BrowserRouter>
    </CartProvider>
    </AuthProvider>
  );
}
