# 🎓 Language Learning Platform Backend

Backend for a **language learning application** that supports interactive learning, real-time communication, and resource management for students and teachers.

---
## 🧑‍💻 Admin Panel Integration
This backend is fully compatible with the [Admin Panel for Language Learning](https://github.com/mmdreza21/admin-panel-learning) built with **NUXT**.  
Use it to manage users, quizzes, tickets, and uploaded resources through a clean and intuitive UI.

---

## 🚀 Features

- 👤 **User Authentication & Role Management**  
  Secure login with JWT and role-based access control.

- 📝 **Exam & Quiz System**  
  Create, manage, and evaluate language learning assessments.

- 🎫 **Ticketing Support**  
  Built-in support system for student-teacher communication.

- 📂 **File Uploads with Multer**  
  Upload PDFs, images, videos, and certificates with MIME-type filtering.

- ⚡ **Real-Time Club Messaging via Socket.IO**  
  Live updates for club messages and answers using Socket.IO events.

- 🗄️ **MongoDB Integration**  
  Mongoose ODM for schema modeling and data validation.

- 🧪 **Integration Testing**  
  Robust test coverage using Jest.

---

## 🛠️ Tech Stack

| Technology     | Purpose                          |
|----------------|----------------------------------|
| Node.js + Express.js | Server & Routing             |
| MongoDB + Mongoose   | Database & ODM               |
| Socket.IO            | Real-time club messaging     |
| Multer               | File uploads                 |
| JWT                  | Authentication               |
| Jest                 | Testing                      |

---

## 📁 Upload Paths

| Type            | Path                   | Allowed Types       |
|-----------------|------------------------|---------------------|
| PDFs (Lessons)  | `uploads/pdf`          | `application/pdf`   |
| Profile Images  | `uploads/profile`      | `jpg`, `jpeg`, `png`|
| Quizzes         | `uploads/quiz`         | `application/pdf`   |
| Certificates    | `uploads/degree`       | `jpg`, `jpeg`, `png`|
| Badges          | `uploads/degreebadget` | `jpg`, `jpeg`, `png`|
| Flags           | `uploads/flag`         | `jpg`, `jpeg`, `png`|
| Videos          | `uploads/video`        | `mp4`               |
| Public Files    | `uploads/public`       | Mixed               |

---

## 🔌 Socket.IO Integration

Real-time communication is implemented for the Club module. Events are emitted when:

- A club message is created, checked, or deleted
- A new answer is posted to a club message



---




