import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Admin from "./pages/Admin";
import AdminProducts from "./pages/AdminProducts";


function App() {

    return (

        <>
            <Navbar />

            <Routes>

                <Route path="/" element={<Home />} />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/cart"
                    element={<Cart />}
                />

                <Route
                    path="/admin"
                    element={<Admin />}
                />

                <Route
                    path="/admin/products"
                    element={<AdminProducts />}
                />

            </Routes>
        </>

    );
}

export default App;