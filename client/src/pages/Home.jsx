import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Upload,
  SplitSquareHorizontal,
  FileArchive,
  FileText,
  FileCode,
  PencilLine,
  LogOut,
} from "lucide-react";

const tools = [
  {
    title: "Upload PDF",
    desc: "Upload PDFs to sign or edit with ease.",
    icon: <Upload size={24} />,
    path: "/upload",
    protected: true,
  },
  {
    title: "Split PDF",
    desc: "Break large PDFs into smaller files.",
    icon: <SplitSquareHorizontal size={24} />,
    path: "/split",
    protected: true,
  },
  {
    title: "Compress PDF",
    desc: "Reduce PDF size for faster uploads and sharing.",
    icon: <FileArchive size={24} />,
    path: "/compress",
    protected: true,
  },
  {
    title: "PDF to Word",
    desc: "Convert PDF documents into editable Word files.",
    icon: <FileText size={24} />,
    path: "/convert/pdf-to-word",
    protected: true,
  },
  {
    title: "Word to PDF",
    desc: "Convert DOC/DOCX files to professional PDFs.",
    icon: <FileCode size={24} />,
    path: "/convert/word-to-pdf",
    protected: true,
  },
  {
    title: "Sign PDF",
    desc: "Place your signature anywhere on the document.",
    icon: <PencilLine size={24} />,
    path: "/dashboard",
    protected: true,
  },
];

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleToolClick = (path, isProtected) => {
    if (isProtected && !user) {
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
      <div className="min-h-screen bg-zinc-50 text-cyan-800 dark:bg-cyan-900 dark:text-white flex flex-col">
      {/* Navbar */}
      <header className="bg-white dark:bg-zinc-800 shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cyan-600">DocSign</h1>
        <nav className="space-x-4 flex items-center">
          {!user ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-sm font-medium text-cyan-600 hover:underline"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="text-sm font-medium text-cyan-800 hover:underline"
              >
                Register
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="text-cyan-600 hover:text-cyan-800"
              title="Logout"
            >
              <LogOut size={22} />
            </button>
          )}
        </nav>
      </header>

      {/* Hero */}
      <div className="text-center px-4 py-16 max-w-4xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-4">Every PDF tool in one place</h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-300">
          All the tools you need to work with PDFs. Merge, split, sign, compress, and convert—quickly and securely.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6 pb-20">
        {tools.map((tool, idx) => (
          <button
            key={idx}
            onClick={() => handleToolClick(tool.path, tool.protected)}
            className="bg-white dark:bg-zinc-800 text-left shadow-md rounded-xl p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center mb-3">
              <div className="bg-cyan-100 text-cyan-600 p-2 rounded-full mr-3">{tool.icon}</div>
              <h3 className="text-lg font-semibold">{tool.title}</h3>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{tool.desc}</p>
          </button>
        ))}
      </div>

      {/* Footer */}
      <footer className="bg-zinc-100 dark:bg-zinc-800 text-center px-6 py-4 mt-auto text-base text-zinc-600 dark:text-zinc-400">
        &copy; {new Date().getFullYear()} DocSign. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
