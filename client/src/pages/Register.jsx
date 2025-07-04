import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, form);
      toast.success("Registration successful. Please login.");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
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
      toast.success(`${name} sign-up successful!`);
      navigate("/");
    } catch (error) {
      if (error.code === "auth/popup-blocked") {
        toast.info("Popup blocked, redirecting...");
        signInWithRedirect(auth, provider);
      } else {
        console.error(`${name} sign-up error:`, error);
        toast.error(`${name} sign-up failed`);
      }
    }
  };

  // Handle redirect result (if popup blocked)
  getRedirectResult(auth)
    .then(async (result) => {
      if (result?.user) {
        const idToken = await result.user.getIdToken();
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/firebase-login`,
          { idToken }
        );
        const userData = { ...res.data.user, token: res.data.token };
        login(userData);
        localStorage.setItem("docsign-user", JSON.stringify(userData));
        toast.success("Social sign-up successful!");
        navigate("/");
      }
    })
    .catch((error) => {
      if (error?.code) {
        console.warn("Redirect signup failed:", error.message);
      }
    });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-100 via-white to-cyan-200 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-xl p-8 shadow-xl space-y-4">
        <h2 className="text-3xl font-bold text-center text-cyan-700">Register</h2>

        {error && (
          <p className="text-sm text-red-600 text-center border border-red-200 bg-red-50 p-2 rounded">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <button
            type="submit"
            className="w-full bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-700 transition"
          >
            Register
          </button>
        </form>

        <div className="my-4 border-t border-zinc-300 text-center text-sm text-zinc-500">OR</div>

        <div className="space-y-2">
          <button
            onClick={() => handleSocialLogin(googleProvider, "Google")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded hover:bg-gray-50"
          >
            <FcGoogle size={20} /> Sign up with Google
          </button>

          <button
            onClick={() => handleSocialLogin(facebookProvider, "Facebook")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded hover:bg-blue-50 text-blue-700"
          >
            <FaFacebookF size={20} /> Sign up with Facebook
          </button>
        </div>

        <p className="text-sm text-center text-zinc-600 mt-2">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-cyan-600 font-medium cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
