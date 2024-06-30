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

## Prerequisites

- Docker
- Make

## Setup Instructions

1. **Clone the repository:**
    ```sh
    git clone https://github.com/colintle/fe-for-everyone.git
    cd fe-for-everyone
    ```

2. **Build the Docker containers:**
    ```sh
    make build
    ```

3. **Start the application:**
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
