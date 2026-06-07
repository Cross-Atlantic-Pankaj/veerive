import React, { useReducer, useState, useEffect, useContext } from 'react';
import axios from '../config/axios';
import PostContext from '../context/PostContext';
import ContextContext from '../context/ContextContext';
import CountryContext from '../context/CountryContext';
import SourceContext from '../context/SourceContext';
import CompanyContext from '../context/CompanyContext';
import MarketDataContext from '../context/MarketDataContext';

const postReducer = (state, action) => {
    switch (action.type) {
        case 'SET_POSTS': 
            return { ...state, data: action.payload.sort((a, b) => new Date(b.date) - new Date(a.date)) }; // ✅ Ensure sorting in reducer
        case 'ADD_POST': 
            return { ...state, data: [action.payload, ...state.data].sort((a, b) => new Date(b.date) - new Date(a.date)) }; // ✅ Always add new post at the top
        case 'REMOVE_POST': 
            return { ...state, data: state.data.filter(ele => ele._id !== action.payload) };
        case 'SET_EDIT_ID': 
            return { ...state, editId: action.payload };
        case 'UPDATE_POST': 
            return {
                ...state,
                editId: null,
                data: state.data.map((ele) =>
                    ele._id === action.payload._id
                        ? { ...action.payload, contexts: action.payload.contexts || [] }
                        : ele
                ).sort((a, b) => new Date(b.date) - new Date(a.date)), // ✅ Ensure sorting after update
            };
        case 'REFRESH_POST_DATA': 
            return {
                ...state,
                // Keep editId unchanged
                data: state.data.some(ele => ele._id === action.payload._id)
                    ? state.data.map((ele) =>
                        ele._id === action.payload._id
                            ? { ...action.payload, contexts: action.payload.contexts || [] }
                            : ele
                    ).sort((a, b) => new Date(b.date) - new Date(a.date))
                    : [action.payload, ...state.data].sort((a, b) => new Date(b.date) - new Date(a.date))
            };
        default:
            return state;
    }
};

// ✅ PostProvider Component
export const PostProvider = ({ children }) => {
    const [posts, postsDispatch] = useReducer(postReducer, { data: [], editId: null });
    const [isFormVisible, setIsFormVisible] = useState(
        localStorage.getItem("isFormVisible") === "true" // ✅ Restore form visibility on reload
    );
    const [successMessage, setSuccessMessage] = useState('');
    
    // ✅ Restore the last visited page from localStorage
    const [page, setPage] = useState(() => parseInt(localStorage.getItem("currentPage")) || 1);
    const [totalPages, setTotalPages] = useState(1);

    // Retrieve other necessary contexts
    //const { contexts } = useContext(ContextContext);
    const contextData = useContext(ContextContext) || {}; // ✅ Ensure it doesn't crash
    const { contexts: contextsData = { data: [] } } = contextData; // ✅ Get contexts object with data property
    const contexts = contextsData.data || []; // ✅ Extract the actual contexts array

    const { countries } = useContext(CountryContext);
    const { companies } = useContext(CompanyContext);
    const { sources } = useContext(SourceContext);
    const { marketData } = useContext(MarketDataContext);

    // ✅ Manual fetch function for lazy loading
    const loadPostsData = () => {
        fetchPosts(page);
    };

    // ✅ DISABLED AUTO-LOADING - Only load when Post page is accessed
    // useEffect(() => {
    //     fetchPosts(page); // ✅ Fetch posts only for the correct page
    // }, [page]); // ✅ Only fetch when `page` changes

    useEffect(() => {
        localStorage.setItem("currentPage", page); // ✅ Store last visited page in localStorage
    }, [page]);

    const fetchPosts = async (currentPage) => {
        const token = sessionStorage.getItem("token"); // ✅ Get token from sessionStorage

        if (!token) {
            return; // Stop API call if no token
        }

        try {
            const response = await axios.get(`/api/admin/posts?page=${currentPage}&limit=10`, {
                headers: { Authorization: `Bearer ${token}` }, // ✅ Use token here
            });

            if (response.data.success) {
                postsDispatch({ type: 'SET_POSTS', payload: response.data.posts });
                setTotalPages(response.data.totalPages || 1);
            }
        } catch (err) {
            console.error("Error fetching posts:", err);
        }
    };

    const fetchAllPosts = async () => {
        const token = sessionStorage.getItem("token");
    
        if (!token) {
            console.error("❌ No token found, user might be logged out.");
            return;
        }
    
        try {
            const response = await axios.get(`/api/admin/posts/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.success) {
                postsDispatch({ type: 'SET_POSTS', payload: response.data.posts });
            }
        } catch (err) {
            console.error("❌ Error fetching all posts:", err);
        }
    };

    // ✅ New function to fetch a single post for editing
    const fetchSinglePost = async (postId) => {
        const token = sessionStorage.getItem("token");
    
        if (!token) {
            console.error("❌ No token found, user might be logged out.");
            return null;
        }
    
        try {
            const response = await axios.get(`/api/admin/posts/${postId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (response.data.success) {
                const post = response.data.post;

                // Convert populated objects back to IDs for form compatibility
                const formattedPost = {
                    ...post,
                    contexts: Array.isArray(post.contexts) ? post.contexts.map(ctx => typeof ctx === 'object' ? ctx._id : ctx) : [],
                    countries: Array.isArray(post.countries) ? post.countries.map(country => typeof country === 'object' ? country._id : country) : [],
                    primaryCompanies: Array.isArray(post.primaryCompanies) ? post.primaryCompanies.map(company => typeof company === 'object' ? company._id : company) : [],
                    secondaryCompanies: Array.isArray(post.secondaryCompanies) ? post.secondaryCompanies.map(company => typeof company === 'object' ? company._id : company) : [],
                    source: Array.isArray(post.source) ? post.source.map(src => typeof src === 'object' ? src._id : src) : [],
                    marketDataDocuments: Array.isArray(post.marketDataDocuments) ? post.marketDataDocuments.map(md => typeof md === 'object' ? md._id : md) : []
                };

                return formattedPost;
            } else {
                console.error("❌ Failed to fetch post:", response.data.message);
                return null;
            }
        } catch (err) {
            console.error("❌ Error fetching single post:", err);
            return null;
        }
    };

    // ✅ Handle Add Click (New Post)
    const handleAddClick = () => {
        postsDispatch({ type: 'SET_EDIT_ID', payload: null }); // ✅ Remove edit mode
        setIsFormVisible(true);
        localStorage.removeItem("postFormData"); // ✅ Remove saved form data
        localStorage.setItem("isFormVisible", "true"); // ✅ Ensure form stays open
    };

    // ✅ Handle Edit Click
    const handleEditClick = async (id) => {
        try {
            // Fetch the specific post data
            const postData = await fetchSinglePost(id);
            
            if (postData) {
                // Check if post exists in current state
                const postExists = posts.data.some(p => p._id === id);

                // Update the posts state to include this post (in case it's not in current view)
                postsDispatch({ type: 'REFRESH_POST_DATA', payload: postData });
                
                // Small delay to ensure state update before setting edit mode
                setTimeout(() => {
                    // Set edit mode
                    postsDispatch({ type: 'SET_EDIT_ID', payload: id });
                    setIsFormVisible(true);
                    localStorage.setItem("editId", id);  
                    localStorage.setItem("isFormVisible", "true"); 
                }, 100);
            } else {
                console.error("Failed to fetch post data for editing");
            }
        } catch (error) {
            console.error("Error in handleEditClick:", error);
        }
    };

    // ✅ Handle Form Submission
    const handleFormSubmit = async (formData, editId = null) => {
        try {
            let response;
            if (editId) {
                // Update existing post
                response = await axios.put(`/api/admin/posts/${editId}`, formData, {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                });
                if (response.data.success) {
                    postsDispatch({ type: 'UPDATE_POST', payload: response.data.updatedPost });
                    setSuccessMessage('Post updated successfully!');
                }
            } else {
                // Create new post
                response = await axios.post('/api/admin/posts', formData, {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                });
                if (response.data.success) {
                    postsDispatch({ type: 'ADD_POST', payload: response.data.post });
                    setSuccessMessage('Post added successfully!');
                }
            }
            
            setIsFormVisible(false);
            localStorage.removeItem("isFormVisible");
            localStorage.removeItem("editId");

            await fetchPosts(page); // Refresh the list
            setTimeout(() => setSuccessMessage(''), 3000);

        } catch (err) {
            console.error("Error submitting form:", err.response?.data || err);
            const errorMsg = err.response?.data?.message || "An unknown error occurred.";
            setSuccessMessage(`Error: ${errorMsg}`);
            setTimeout(() => setSuccessMessage(''), 5000);
        }
    };

    // ✅ Restore Form State on Reload
    useEffect(() => {
        const savedEditId = localStorage.getItem("editId");
        const savedFormVisible = localStorage.getItem("isFormVisible");

        if (savedEditId) {
            postsDispatch({ type: 'SET_EDIT_ID', payload: savedEditId });
        }

        if (savedFormVisible === "true") {
            setIsFormVisible(true);
        }
    }, []);

    const handleGoToPostList = () => {
        setIsFormVisible(false);
        localStorage.removeItem("isFormVisible"); // ✅ Ensure it resets
    };

    return (
        <PostContext.Provider value={{ 
            posts, postsDispatch, fetchPosts,
            isFormVisible, setIsFormVisible,
            handleAddClick, handleEditClick, handleFormSubmit, 
            contexts, countries, companies, sources, marketData,
            page, setPage, totalPages, setTotalPages,
            handleGoToPostList, fetchAllPosts, fetchSinglePost
        }}>
            {successMessage && <div className="success-message">{successMessage}</div>}
            {children}
        </PostContext.Provider>
    );
};
