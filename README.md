# 🎥 VaaniTube

**VaaniTube** is an **open-source, microservice-based video hosting & streaming platform**.
The goal is to build a **scalable, modular, and cloud-native system** where each service can be written in **any suitable technology** (Node.js, Spring Boot, Go, etc).

> This project focuses on **real-world architecture**, not just a demo app.

---

## 🧠 Philosophy

* 🧩 **Microservices first**
* 🔁 Each service can use **its own tech stack**
* ⚡ Performance, scalability, and maintainability over shortcuts
* 🔓 Open for community-driven architecture improvements

---

## 🏗️ Architecture (High Level)

* 🎯 API Gateway
* 👤 Auth Service
* 📤 Upload Service
* 🎞️ Video Processing Service
* 📡 Streaming / Delivery Service
* 🗃️ Metadata Service
* 📬 Queue / Worker Services
* 📊 Analytics (planned)

Each service:

* Is **independent**
* Has **its own repo/module**
* Can be written in:

  * Node.js
  * Spring Boot (Java)
  * Or any other suitable backend tech

---

## 🚀 Tech Stack (Flexible)

Currently used / planned:

* **Node.js** (some microservices)
* **Spring Boot** (some microservices)
* **Storage:** S3 / MinIO / Cloudflare R2
* **Database:** MongoDB / PostgreSQL / Redis
* **Queue:** BullMQ / Redis / Kafka (future)
* **Streaming:** HTTP Range / Chunked streaming
* **Infra:** Docker, Docker Compose (K8s later)

> This is a **polyglot microservice system**. Tech choice is per-service, not global.

---

## 🤝 Contributing

Contributions are **highly welcome**, including:

* 🧱 New microservices (in Node.js, Spring Boot, or anything else)
* ⚡ Performance improvements
* 🔐 Security enhancements
* 🧠 Architecture suggestions
* 🧹 Refactoring & cleanup
* 📝 Documentation improvements

### How to contribute:

1. Fork this repository
2. Create a new branch (`feature/my-service` or `improvement/xyz`)
3. Commit your changes
4. Push to your fork
5. Open a Pull Request

---

## 💡 Ideas & Suggestions

If you have:

* Better architecture ideas
* Scaling strategies
* Database design improvements
* Streaming optimizations
* Cost-saving ideas

➡️ Please open an **Issue** or **Discussion**.

---

## ⚠️ Project Status

* 🚧 Under active development
* 🔁 Things may change or be refactored
* 🧪 Some services are experimental

---

## 📜 License

This project is licensed under the **MIT License**.

---

## ⭐ Support

If you like this project:

* Give it a ⭐
* Share ideas
* Or contribute a service

---

> Built as a real-world, production-style system by the VaaniTube community
