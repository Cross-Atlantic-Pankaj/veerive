import { useReducer, useEffect , useState} from 'react'; // Importing React hooks for state management and side effects
import { useNavigate } from 'react-router-dom'; // Importing hook for programmatic navigation
import { toast } from 'react-toastify'; // Importing toast notifications for user feedback
import AuthContext from '../context/AuthContext'; // Importing AuthContext to provide authentication state and functions
import axios from '../config/axios'; // Importing axios instance configured for API calls

// Initial state for the authentication context
const initialState = {
    user: null, // Initially, no user is logged in
    isLoggedIn: false // Initially, the user is not logged in
};

// Reducer function to handle state changes based on actions
const reducer = (state, action) => {
    switch(action.type) {
        case 'LOGIN_USER': {
            // On login action, set user data and update login status
            return { ...state, isLoggedIn: true, user: action.payload };
        } 
        case 'LOGOUT_USER': {
            // On logout action, clear user data and update login status
            return { ...state, isLoggedIn: false, user: null };
        }
        default:
            // Return the current state if the action type does not match
            return state;
    }
};

// AuthProvider component to manage authentication logic
function AuthProvider(props) {
    const navigate = useNavigate(); // Initialize navigate for redirecting users
    const [state, dispatch] = useReducer(reducer, initialState); // Initialize state and dispatch for handling state changes
    const [loading, setLoading] = useState(true);
//    useEffect(() => {
//         // On mount, attempt to retrieve user
//         (async () => {
//           if (sessionStorage.getItem('token')) {
//             try {
//               const userResponse = await axios.get('/api/users/account', {
//                 headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
//               });
//               dispatch({ type: 'LOGIN_USER', payload: userResponse.data });
//             } catch (err) {
//               console.error('Error fetching user data:', err);
//               sessionStorage.removeItem('token'); 
//             }
//           }
//           setLoading(false);  // <= Done checking token
//         })();
//       }, []);

useEffect(() => {
    // On mount, attempt to retrieve user
    (async () => {
        const storedToken = sessionStorage.getItem('token');
        if (storedToken) {
            try {
                const userResponse = await axios.get('/api/users/account', {
                    headers: { Authorization: `Bearer ${storedToken}` },
                });
                dispatch({ type: 'LOGIN_USER', payload: userResponse.data });
        } catch (err) {
            if (err.response && err.response.status === 401) {
                sessionStorage.removeItem('token'); 
            }
        }
        }
        setLoading(false);
    })();
}, []);

    // Function to handle user registration
        const handleRegister = async (formData) => {
        try {
            const response = await axios.post('/api/users/register', formData);
            toast(response.data.message || 'Successfully Registered', { autoClose: 2000 }); // Use response message if available
            navigate('/login');
        } catch (err) {

        }
    };
    
    // Function to handle user login
   
  //   const handleLogin = async (formData) => {
  //   setLoading(true);
  //   try {
  //     const response = await axios.post('/api/users/login', formData, { withCredentials: true });
  //     sessionStorage.setItem('token', response.data.token);

  //     // fetch the user
  //     const userResponse = await axios.get('/api/users/account', {
  //       headers: { Authorization: `Bearer ${response.data.token}` },
  //     });
  //     dispatch({ type: 'LOGIN_USER', payload: userResponse.data });
      
  //     // done loading user
  //     setLoading(false);

  //     navigate('/admin-home');
  //   } catch (err) {
  //     setLoading(false);
  //     // Handle error
  //   }
  // };

//   const handleLogin = async (formData) => {
//     setLoading(true);
//     try {
//         const response = await axios.post('/api/users/login', formData, { withCredentials: true });
        
//         if (response.data.token) {
//             sessionStorage.setItem('token', response.data.token); // ✅ Ensure token is stored
//         } else {
//             console.error("❌ No token received from login API");
//         }

//         const userResponse = await axios.get('/api/users/account', {
//             headers: { Authorization: `Bearer ${response.data.token}` },
//         });

//         dispatch({ type: 'LOGIN_USER', payload: userResponse.data });
//         setLoading(false);
//         navigate('/admin-home');
//     } catch (err) {
//         setLoading(false);
//         console.error("❌ Error during login:", err);
//         toast.error("Login failed. Please check credentials.");
//     }
// };
const handleLogin = async (formData) => {
    setLoading(true);
    try {
        const response = await axios.post('/api/users/login', formData, { withCredentials: true });

        if (response.data.token) {
            sessionStorage.setItem('token', response.data.token);
        } else {
            throw new Error('No token received from login API');
        }

        const userResponse = await axios.get('/api/users/account', {
            headers: { Authorization: `Bearer ${response.data.token}` },
        });

        dispatch({ type: 'LOGIN_USER', payload: userResponse.data });
        setLoading(false);
        navigate('/admin-home');
    } catch (err) {
        setLoading(false);
        toast.error("Login failed. Please check credentials.");
        throw err; // Re-throw the error so Login component can catch it
    }
};

    // Function to handle user logout
    const handleLogout = () => {
        sessionStorage.removeItem('token');
        localStorage.removeItem('currentPage'); // ✅ Reset stored page
        dispatch({ type: 'LOGOUT_USER' });
        toast("Successfully logged out");
        navigate('/login'); // ✅ Redirect to login
    };

    // Provide authentication state and functions to child components
    return (
        <AuthContext.Provider value={{ state, handleRegister, loading, handleLogin, handleLogout }}>
            {props.children} 
        </AuthContext.Provider>
    );
}

export default AuthProvider;

