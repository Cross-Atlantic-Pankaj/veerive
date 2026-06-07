import { Navigate } from 'react-router-dom'; // Import Navigate component from react-router-dom for handling redirects

// Define a functional component named PrivateRoute
export default function PrivateRoute(props) {
    // Check if a token exists in localStorage (indicating the user is authenticated)
    if (sessionStorage.getItem('token')) {
        // If a token exists, render the child components passed to PrivateRoute
        return props.children;
    } else {
        // If no token exists, redirect the user to the login page
        return <Navigate to="/login" />;
    }
}
