# FE: For Everyone

This project is a collaborative environment designed for students at the University of Central Florida (UCF) to study for the Foundation Exam. The platform allows real-time coding sessions, room creation, problem statement changes, and user management, providing an interactive and engaging study experience.

## Features

- **Collaborative Coding:** Real-time coding sessions using WebSockets in Golang.
- **User and Room Management:** Creation, deletion, and management of study rooms and user roles.
- **Problem Statement Updates:** Ability to change problem statements dynamically.
- **Robust Backend:** Built with Java Spring Boot for API functionality.
- **Persistent Storage:** Utilizes PostgreSQL for data storage and Redis for live coding session management.

## Technologies Used

- **Frontend:** React
- **Backend:** Java Spring Boot
- **Real-time Communication:** WebSockets in Golang
- **Databases:** PostgreSQL, Redis
- **Message Broker**: RabbitMQ

## Prerequisites

- Docker
- Make

## Setup Instructions

1. **Clone the repository:**
    ```sh
    git clone https://github.com/colintle/fe-for-everyone.git
    cd fe-for-everyone
    ```

2. **Navigate to the frontend directory and install dependencies:**
    ```sh
    cd frontend
    npm install
    ```

### Windows Line Ending Conversion for `mvnw`

If you are on Windows, you need to convert the line endings of the `mvnw` file from Windows-style (CRLF) to Unix-style (LF) to ensure compatibility with Unix-based environments like Docker.

- **Using Visual Studio Code:**
  1. **Open the `mvnw` file** in Visual Studio Code.
  2. **Locate the line ending format** at the bottom-right corner of the window (e.g., `CRLF`).
  3. **Click on the line ending format** and select `LF` to convert the line endings.
  4. **Save the file**.

3. **Build the Docker containers:**
    ```sh
    make build
    ```

4. **Start the application:**
    ```sh
    make start-attached
    ```

## Project Structure

- **frontend/** - React application source code
- **backend/** - Java Spring Boot application source code
- **websocket-service/** - Golang WebSocket server source code
- **database/** - PostgreSQL and Redis configuration

## Environment Variables

Ensure to configure your `.env` file with the necessary environment variables. Use the template provided from .env.example
