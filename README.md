# CareerCatalyst

**Empower your professional growth with personalized guidance, resources, and opportunities tailored for students, freshers, and experienced professionals.**

CareerCatalyst is a full-stack web application designed to help users navigate their career paths. It provides AI-driven career recommendations, skill gap analysis, and personalized learning roadmaps to bridge the gap between a user's current qualifications and their desired career goals.

---

## Key Features

-   **Personalized Dashboards**: Separate, tailored dashboards for Students, Freshers, and Experienced Professionals.
-   **AI-Powered Career Recommendations**: Leverages the Groq AI SDK to provide intelligent career suggestions based on user skills, interests, and experience.
-   **Skill Gap Analysis**: Identifies the skills users need to acquire to transition into their desired roles.
-   **Dynamic Learning Roadmaps**: Generates step-by-step learning paths to help users acquire missing skills.
-   **PDF Roadmap Export**: Users can download their personalized career roadmaps as a PDF document.
-   **Inspirational Profile Discovery**: Find and save LinkedIn profiles of professionals in target roles to understand their career trajectories.
-   **Secure Authentication**: JWT-based authentication to protect user data and sessions.
-   **Responsive UI**: A modern, dark-themed, and responsive user interface built with React.

---

## Tech Stack

### Backend
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB with Mongoose ODM
-   **Authentication**: JSON Web Tokens (JWT), bcrypt.js
-   **AI Integration**: Groq SDK
-   **File Generation**: pdfkit

### Frontend
-   **Library**: React
--   **Routing**: React Router
-   **Styling**: CSS with custom properties (variables) for theming.

### Development & Tooling
-   **Dev Server**: `nodemon` for backend, `react-scripts` for frontend.
-   **Diagram Conversion**: `sharp` for SVG to PNG conversion.
-   **Report Generation**: `markdown-it` and `html-docx-js` for report creation.

---

## System Architecture

The project follows a standard client-server architecture.

![Architecture Diagram](./docs/architecture.png)
*Figure 1: High-level system architecture.*

![ER Diagram](./docs/er-diagram.png)
*Figure 2: Database schema (ER Diagram).*

---

## Prerequisites

Before you begin, ensure you have the following installed:
-   [Node.js](https://nodejs.org/en/) (v18.x or higher recommended)
-   [npm](https://www.npmjs.com/) (usually comes with Node.js)
-   A running [MongoDB](https://www.mongodb.com/try/download/community) instance (local or cloud-based like MongoDB Atlas).

---

## Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Harmi-kotak22/CareerCatalyst.git
    cd CareerCatalyst
    ```

2.  **Setup the Backend:**
    -   Navigate to the backend directory:
        ```bash
        cd backend
        ```
    -   Install dependencies:
        ```bash
        npm install
        ```
    -   Create a `.env` file in the `backend` directory and add the following environment variables:
        ```env
        MONGO_URI=<your_mongodb_connection_string>
        JWT_SECRET=<your_jwt_secret_key>
        GROQ_API_KEY=<your_groq_api_key>
        GOOGLE_API_KEY=<your_google_api_key>
        GOOGLE_CSE_ID=<your_google_cse_id>
        ```

3.  **Setup the Frontend:**
    -   Navigate to the frontend directory from the root:
        ```bash
        cd ../frontend
        ```
    -   Install dependencies:
        ```bash
        npm install
        ```

---

## Running the Application

You need to run both the backend and frontend servers simultaneously in separate terminals.

1.  **Start the Backend Server:**
    -   From the `backend` directory, run:
        ```bash
        npm run dev
        ```
    -   The server will start on `http://localhost:5000`.

2.  **Start the Frontend Application:**
    -   From the `frontend` directory, run:
        ```bash
        npm start
        ```
    -   The React application will open in your browser at `http://localhost:3000`.

---

## Project Structure

```
.
├── backend/
│   ├── controllers/    # Request handlers (business logic)
│   ├── middlewares/    # Express middlewares (e.g., auth)
│   ├── models/         # Mongoose schemas and models
│   ├── routes/         # API route definitions
│   ├── utils/          # Helper functions (AI services, PDF gen)
│   ├── .env            # Environment variables (local)
│   ├── package.json
│   └── server.js       # Express server entry point
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/ # React components
│       ├── App.js      # Main component with routing
│       └── index.js    # React app entry point
├── docs/
│   ├── architecture.png
│   └── er-diagram.png
├── tools/              # Helper scripts for conversion
├── CareerCatalyst_Report.md
├── CareerCatalyst_Report.docx
└── README.md
```

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
