import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from "react";
import { io } from "socket.io-client";
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Favourites from './pages/Favourites';
import Notifications from './pages/Notifications';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Sell from './pages/Sell';
import ProductDetails from './pages/ProductDetails'
import SearchResults from './pages/SearchResults';
import ChatPage from './pages/ChatPage';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css'

const socket = io("http://localhost:5000"); // adjust if needed

function App () {
    useEffect(() => {
        const userId = localStorage.getItem("userId");
        if (userId) {
            socket.emit("register", userId);
        }
        socket.on("new_notification", (data) => {
            window.dispatchEvent(new CustomEvent("newNotification", { detail: data }));
        });
        return () => socket.off("new_notification");
    }, []);

    return (
        <>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home/>}>
                    <Route path="favourites" element={<Favourites />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="search" element={<SearchResults />} />
                    <Route path="chats" element={
                  <ErrorBoundary>
                    <ChatPage />
                  </ErrorBoundary>
                } />
                </Route>
                <Route path="/login" element={<Login/>} />
                <Route path="/signup" element={<Signup/>} />
                <Route path="/sell" element={<Sell/>} />
                <Route path="/product/:id" element={<ProductDetails />} />
            </Routes>
        </BrowserRouter>
        </>
    )
}
export default App;