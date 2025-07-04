import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { auth } from "../firebase";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        formData
      );
      const userData = { ...res.data.user, token: res.data.token };
      login(userData);
      localStorage.setItem("docsign-user", JSON.stringify(userData));
      toast.success("Login successful!");
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      setError(msg);
      toast.error(msg);
    }
  };

const handleSocialLogin = async (provider, name) => {
  try {
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();

    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/firebase-login`,
      { idToken }
    );

    const userData = { ...res.data.user, token: res.data.token };
    login(userData);
    localStorage.setItem("docsign-user", JSON.stringify(userData));
    toast.success(`${name} login successful!`);
    navigate("/");
  } catch (error) {
    console.error(`${name} login error:`, error);

    if (error.code === "auth/popup-closed-by-user") {
      toast.warn(`${name} login popup was closed by user.`);
    } else if (error.code === "auth/network-request-failed") {
      toast.error("Network error, check your internet connection.");
    } else {
      toast.error(`${name} login failed`);
    }
  }
};



  // If login was done via redirect
 /* getRedirectResult(auth)
    .then(async (result) => {
      if (result) {
        const idToken = await result.user.getIdToken();
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/firebase-login`,
          { idToken }
        );
        const userData = { ...res.data.user, token: res.data.token };
        login(userData);
        localStorage.setItem("docsign-user", JSON.stringify(userData));
        toast.success("Social login successful!");
        navigate("/");
      }
    })
    .catch((error) => {
      if (error?.code) {
        console.warn("Redirect login failed:", error.message);
      }
    });*/

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-100 to-cyan-300 px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-zinc-800 mb-1">Log in</h2>
        <p className="text-sm text-center text-zinc-500 mb-4">Enter your credentials below</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-600">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full mt-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-600">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full mt-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-600 text-white py-2 rounded-md hover:bg-cyan-700 transition"
          >
            Log In
          </button>
        </form>

        <div className="my-4 border-t border-zinc-300 text-center text-sm text-zinc-500">OR</div>

        <div className="space-y-2">
          <button
            onClick={() => handleSocialLogin(googleProvider, "Google")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded hover:bg-gray-50"
          >
            <FcGoogle size={20} /> Login with Google
          </button>

          <button
            onClick={() => handleSocialLogin(facebookProvider, "Facebook")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded hover:bg-blue-50 text-blue-700"
          >
            <FaFacebookF size={20} /> Login with Facebook
          </button>
        </div>

        <p className="text-center text-sm text-zinc-600 mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-cyan-600 hover:underline font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
