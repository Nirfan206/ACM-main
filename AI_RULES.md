# AI Rules for AL CHAAN MEERA Web App

This document outlines the core technologies and library usage guidelines for the AL CHAAN MEERA web application. Adhering to these rules ensures consistency, maintainability, and leverages the strengths of the chosen tech stack.

## Tech Stack Overview

*   **Frontend:** React.js (Client-side UI)
*   **Backend:** Node.js with Express.js (Server-side API)
*   **Database:** MongoDB (NoSQL database)
*   **ORM/ODM:** Mongoose (for MongoDB interaction in Node.js)
*   **Routing (Frontend):** React Router DOM
*   **State Management (Frontend):** React's built-in state management (useState, useContext)
*   **HTTP Requests (Frontend):** Axios
*   **Authentication:** JWT (JSON Web Tokens) for sessions, bcrypt for password hashing, Twilio for phone-based OTP (though OTP verification is currently skipped in registration).
*   **Styling:** CSS Modules (`.css` files) for global styles, inline styles for component-specific theming.
*   **Package Manager:** npm

## Library Usage Rules

To maintain a consistent and efficient codebase, please follow these guidelines for library usage:

*   **React:**
    *   **UI Development:** Always use React for building user interfaces.
    *   **Component Structure:** Create small, focused components in their own files (`src/components/`).
    *   **State Management:** Prefer `useState` and `useContext` for local and global state management respectively. Avoid external state management libraries unless a clear need arises and is approved.
*   **React Router DOM:**
    *   **Routing:** Use `react-router-dom` for all client-side routing.
    *   **Route Definitions:** Keep main application routes defined in `client/src/App.js`.
    *   **Navigation:** Use `Link` components for internal navigation and `useNavigate` hook for programmatic navigation.
*   **Axios:**
    *   **API Calls:** All HTTP requests to the backend API should be made using Axios.
    *   **Authentication Headers:** Ensure `Authorization: Bearer <token>` is included in headers for all protected routes.
*   **Node.js & Express.js:**
    *   **Backend API:** Use Express.js for defining all backend routes and API endpoints.
    *   **Middleware:** Implement middleware for authentication (`authMiddleware.js`), error handling (`errorHandler.js`), and other cross-cutting concerns.
*   **Mongoose:**
    *   **Database Interaction:** Use Mongoose for defining schemas, models, and interacting with the MongoDB database.
    *   **Schema Definitions:** Define clear and concise schemas for all data models in `server/models/`.
*   **Styling:**
    *   **Global Styles:** Use `client/src/styles/global.css` for application-wide styles and resets.
    *   **Component-Specific Styling:** For component-level styling, use inline styles as currently implemented, leveraging theme objects for consistency. Avoid introducing new CSS preprocessors or styling libraries (e.g., Styled Components, Emotion) unless explicitly approved.
*   **Authentication:**
    *   **JWT:** Use `jsonwebtoken` for creating and verifying JWTs for user sessions.
    *   **Password Hashing:** Use `bcrypt` or `bcryptjs` for hashing and comparing user passwords.
    *   **Twilio:** Utilize the `twilio` package for SMS-based functionalities (e.g., OTP, notifications).
*   **Utility Libraries:**
    *   `jwt-decode`: For decoding JWTs on the client-side.
    *   `formik` and `yup`: For form handling and validation.

---