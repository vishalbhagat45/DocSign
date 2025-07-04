# 📑 DocSign - Digital Signature App

A secure and modern full-stack web application to upload, sign, and download PDF documents digitally — inspired by DocuSign. Built with the MERN stack + drag & drop + PDF editing via `pdf-lib`.

---

## 🌟 Key Highlights

- 🔐 **JWT Authentication** (Login/Register)
- 📤 **PDF Upload & Preview**
- 🖋️ **Drag & Drop Signature** (Image or Text)
- 🧾 **Embed Signatures into PDF** using `pdf-lib`
- 📥 **Download Signed PDF**
- 📝 **Audit Trail** (Who signed and when)
- 🧑‍💼 **Role-based Access** (User/Admin)
- 🧩 Optional: **Facebook Login**
- ⚡ **Fast UI** with React + Vite + Tailwind CSS

---

## 🧱 Tech Stack

| Layer       | Technologies                         |
|-------------|--------------------------------------|
| Frontend    | React, Vite, Tailwind, React PDF     |
| Backend     | Node.js, Express.js, MongoDB, Mongoose |
| PDF Engine  | pdf-lib                              |
| Auth        | JWT, bcrypt                          |
| File Upload | Multer                               |
| Extra       | React Draggable, Toastify, Facebook OAuth *(optional)* |

---

## 🧑‍💻 Local Development

### 🔹 Backend (Express)

```bash
cd server
npm install
npm run dev
