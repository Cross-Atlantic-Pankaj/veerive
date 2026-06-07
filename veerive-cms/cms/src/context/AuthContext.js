import { createContext } from "react";
// Import the createContext function from React to create a new context

const AuthContext = createContext();
// Create a new context object named AuthContext
// This context will be used to provide and consume authentication-related data across the application

export default AuthContext;
// Export the AuthContext object as the default export from this module
// This allows other components or modules to import and use AuthContext
