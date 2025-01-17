import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import default styles
import PrivateRoute from "./services/PrivateRoute";
import NavBar from "./components/NavBar";
import EditProfile from "./pages/EditProfile";
import "@fortawesome/fontawesome-free/css/all.min.css";

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark" // or "light" to match the theme toggle
      />

      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
