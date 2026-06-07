import React, { useContext, useState, useEffect, useMemo } from "react";
import PostContext from "../../context/PostContext";
import ContextContext from "../../context/ContextContext";
import MasterDataContext from "../../context/MasterDataContext";
import axios from "../../config/axios";
import "../../html/css/Post.css";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation } from 'react-router-dom';
import { saveAs } from 'file-saver';
import AuthContext from '../../context/AuthContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import LoadingSpinner from '../../components/LoadingSpinner';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function PostList() {
    const { posts, postsDispatch, handleAddClick, handleEditClick, fetchSinglePost } = useContext(PostContext);
    const { contexts, isLoading } = useContext(ContextContext);
    const masterData = useContext(MasterDataContext);
    const { state } = useContext(AuthContext);
    const userRole = state.user?.role;

    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: "date", direction: "descending" });
    const [page, setPage] = useState(() => parseInt(localStorage.getItem("currentPage")) || 1);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [allPosts, setAllPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        itemToDelete: null
    });
    const itemsPerPage = 10;

    const fetchAllPosts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/admin/posts/all`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
            });
            
            if (response.data.success) {
                const postsData = response.data.posts || response.data.data || [];
                setAllPosts(postsData);
            } else {
                toast.error("Failed to fetch all posts");
                setAllPosts([]);
            }
        } catch (error) {
            toast.error("Failed to fetch all posts. Please try again.");
            setAllPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const location = useLocation();
    const query = useQuery();
    const editIdFromQuery = query.get('editId');
    useEffect(() => {
        const handleEditFromQuery = async () => {
            if (editIdFromQuery && fetchSinglePost) {
                await handleEditClick(editIdFromQuery);
            }
        };
        handleEditFromQuery();
    }, [editIdFromQuery, fetchSinglePost, handleEditClick]);

    useEffect(() => {
        const storedPage = parseInt(localStorage.getItem("currentPage"), 10);
        if (storedPage) {
            setPage(storedPage);
        }
    }, []);

    useEffect(() => {
        if (page) {
            localStorage.setItem("currentPage", page);
        }
    }, [page]);

    useEffect(() => {
        if (!sessionStorage.getItem("token")) {
            setPage(1);
            localStorage.removeItem("currentPage");
        }
    }, []);

    // Fetch all posts on component mount
    useEffect(() => {
        fetchAllPosts();
    }, []);

    useEffect(() => {
        if (searchQuery === "") {
            fetchAllPosts();
        }
    }, [searchQuery]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchQuery.trim() !== "") {
                handleSearch();
            } else {
                fetchAllPosts();
            }
        }, 100);
        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    const handleSearch = async () => {
        // Search is now handled client-side in the filteredPosts useMemo
        setPage(1); // Reset to first page when searching
    };
    
    const getContextName = (contextsArray) => {
        if (!contextsArray || !Array.isArray(contextsArray) || contextsArray.length === 0) {
            return "No Contexts";
        }
    
        return contextsArray
            .map(ctx => {
                if (typeof ctx === "string") {
                    return getContextTitleFromStore(ctx);
                } else if (ctx?._id && ctx.contextTitle) {
                    return ctx.contextTitle;
                } else {
                    return "Unknown Context";
                }
            })
            .join(", ");
    };
    
    const getContextTitleFromStore = (contextId) => {
        if (!contexts?.data || contexts.data.length === 0) return "Unknown Context";
        const context = contexts.data.find(c => c._id === contextId);
        return context ? context.contextTitle : "Unknown Context";
    };
    
    const requestSort = (key) => {
        let direction = "ascending";
    
        if (sortConfig.key === key) {
            direction = sortConfig.direction === "ascending" ? "descending" : "ascending";
        }
    
        setSortConfig({ key, direction });
    };
    
    const filteredPosts = useMemo(() => {
        let data = [...allPosts];
        if (dateRange.start && dateRange.end) {
            data = data.filter(post => {
                const d = new Date(post.date);
                return d >= new Date(dateRange.start) && d <= new Date(dateRange.end);
            });
        }
        if (searchQuery.trim()) {
            data = data.filter(post => (post.postTitle || '').toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return data;
    }, [allPosts, dateRange, searchQuery]);

    // Helper to normalize strings for sorting
    function normalizeString(str) {
        return (str || '')
            .replace(/^[^a-zA-Z0-9]+/, '') // Remove leading non-alphanumeric chars
            .trim()
            .toLowerCase();
    }

    // Combined filtering and sorting
    const processedPosts = useMemo(() => {
        let data = [...filteredPosts];
    
        if (sortConfig !== null) {
            data.sort((a, b) => {
                let aValue, bValue;
    
                switch (sortConfig.key) {
                    case "postTitle":
                    case "postType":
                        aValue = normalizeString(a[sortConfig.key]);
                        bValue = normalizeString(b[sortConfig.key]);
                        return sortConfig.direction === "ascending" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    
                    case "date":
                        aValue = new Date(a.date || 0);
                        bValue = new Date(b.date || 0);
                        return sortConfig.direction === "ascending" ? aValue - bValue : bValue - aValue;
    
                    case "context":
                        aValue = normalizeString(getContextName(a.context));
                        bValue = normalizeString(getContextName(b.context));
                        return sortConfig.direction === "ascending" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    
                    case "isTrending":
                        aValue = a.isTrending ? 1 : 0;
                        bValue = b.isTrending ? 1 : 0;
                        return sortConfig.direction === "ascending" ? aValue - bValue : bValue - aValue;

                    default:
                        aValue = normalizeString(a[sortConfig.key]);
                        bValue = normalizeString(b[sortConfig.key]);
                        return sortConfig.direction === "ascending" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
            });
        }
    
        return data;
    }, [filteredPosts, sortConfig, contexts?.data]);
    
    // Frontend pagination
    const totalPages = Math.max(1, Math.ceil(processedPosts.length / itemsPerPage));
    const currentPage = Math.min(page, totalPages);
    const paginatedPosts = processedPosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Reset page if current page is beyond total pages
    useEffect(() => {
        if (currentPage > totalPages) {
            setPage(1);
        }
    }, [totalPages, currentPage]);

    const handleNextPage = () => {
        if (currentPage < totalPages) setPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setPage(currentPage - 1);
    };

    
    const handleRemoveClick = (id, postTitle) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Delete Post',
            message: `Are you sure you want to delete "${postTitle}"? This action cannot be undone.`,
            onConfirm: () => handleRemove(id),
            itemToDelete: id
        });
    };

    const handleRemove = async (id) => {
        try {
            const response = await axios.delete(`/api/admin/posts/${id}`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
            });
    
            if (response.status === 200) {
                postsDispatch({ type: "REMOVE_POST", payload: id });
                toast.success('posts removed successfully!')
                await fetchAllPosts(); // Refresh all posts after deletion
            }
        } catch (error) {
            toast.error("Failed to delete post. Please try again.");
        } finally {
            setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }
    };

    const handleCloseModal = () => {
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    };

    const resolveField = (field, type) => {
        if (!field) return '';
        if (Array.isArray(field)) {
            return field.map(f => resolveField(f, type)).join(', ');
        }
        if (typeof field === 'object' && field._id) {
            switch (type) {
                case 'company':
                    return field.companyName || field;
                case 'source':
                    return field.sourceName || field;
                case 'context':
                    return field.contextTitle || field;
                default:
                    return field;
            }
        }
        // Lookup from context
        switch (type) {
            case 'context':
                if (contexts?.data) {
                    const ctx = contexts.data.find(c => String(c._id) === String(field));
                    return ctx ? ctx.contextTitle : field;
                }
                break;
            case 'company':
                if (masterData?.masterData?.companies) {
                    const company = masterData.masterData.companies.find(c => String(c._id) === String(field));
                    return company ? company.companyName : field;
                }
                break;
            case 'source':
                if (masterData?.masterData?.sources) {
                    const source = masterData.masterData.sources.find(s => String(s._id) === String(field));
                    return source ? source.sourceName : field;
                }
                break;
            default:
                return field;
        }
        return field;
    };

    const handleDownloadCSV = async () => {
        try {
            // Fetch fresh data directly instead of relying on state
            const response = await axios.get(`/api/admin/posts/all`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
            });
            
            if (!response.data.success) {
                toast.error("Failed to fetch posts data");
                return;
            }
            
            let posts = response.data.posts || [];
            // Apply filters
            let filtered = [...posts];
            
            if (dateRange.start && dateRange.end) {
                const startDate = new Date(dateRange.start);
                const endDate = new Date(dateRange.end);
                filtered = filtered.filter(post => {
                    const postDate = new Date(post.date);
                    return postDate >= startDate && postDate <= endDate;
                });
            }
            
            if (searchQuery.trim()) {
                filtered = filtered.filter(post => 
                    (post.postTitle || '').toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            if (filtered.length === 0) {
                toast.warning("No data available for the selected filters");
                return;
            }

            const headers = [
                'Post Title', 'Context', 'Post Type', 'Is Trending', 'Summary', 
                'Complete Content', 'Primary Companies', 'Secondary Companies', 'Source', 
                'Source URLs', 'Sentiment', 'Created At', 'Updated At'
            ];
            const rows = filtered.map((post, index) => {
                try {
                    // Safely resolve field values with better error handling
                    const resolveFieldSafe = (field, type) => {
                        try {
                            return resolveField(field, type);
                        } catch (err) {
                            return String(field || '');
                        }
                    };
                    
                    const primaryCompanyNames = Array.isArray(post.primaryCompanies) 
                        ? post.primaryCompanies.map(company => resolveFieldSafe(company, 'company')).join(', ')
                        : resolveFieldSafe(post.primaryCompanies, 'company');

                    const secondaryCompanyNames = Array.isArray(post.secondaryCompanies)
                        ? post.secondaryCompanies.map(company => resolveFieldSafe(company, 'company')).join(', ')
                        : resolveFieldSafe(post.secondaryCompanies, 'company');

                    return [
                        post.postTitle || '',
                        resolveFieldSafe(post.contexts, 'context'),
                        post.postType || '',
                        post.isTrending ? 'Yes' : 'No',
                        (post.summary || '').replace(/[\r\n]+/g, ' '), // Clean line breaks
                        (post.completeContent || '').replace(/[\r\n]+/g, ' '), // Clean line breaks
                        primaryCompanyNames,
                        secondaryCompanyNames,
                        resolveFieldSafe(post.source, 'source'),
                        (post.sourceUrls || []).join('; '), // Use semicolon to avoid CSV issues
                        post.sentiment || '',
                        post.createdAt ? new Date(post.createdAt).toLocaleString() : '',
                        post.updatedAt ? new Date(post.updatedAt).toLocaleString() : '',
                    ];
                } catch (rowError) {
                    console.error(`Error processing post ${index}:`, rowError);
                    // Return a safe row with basic data
                    return [
                        post.postTitle || '',
                        'Error processing data',
                        post.postType || '',
                        post.isTrending ? 'Yes' : 'No',
                        'Error processing data',
                        '',
                        '',
                        '',
                        '',
                        '',
                        post.sentiment || '',
                        '',
                        ''
                    ];
                }
            });
            // Create CSV content with better escaping
            const csvContent = [headers, ...rows]
                .map(row => 
                    row.map(cell => {
                        const cellValue = String(cell || '');
                        // Escape quotes and wrap in quotes
                        const escapedCell = cellValue.replace(/"/g, '""');
                        return `"${escapedCell}"`;
                    }).join(',')
                ).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            
            const filename = dateRange.start && dateRange.end 
                ? `posts_${dateRange.start}_${dateRange.end}.csv`
                : 'all_posts.csv';
                
            saveAs(blob, filename);
            toast.success(`Successfully downloaded ${rows.length} posts`);
        } catch (error) {
            console.error('CSV Download Error:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
            toast.error(`Failed to download CSV: ${error.message}`);
        }
    };

    const handleShowPostContexts = async (postId) => {
        try {
            // Query the context collection to find all contexts that contain this post ID
            const response = await axios.post(`/api/admin/contexts/by-post`, {
                postId: postId
            }, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
            });
            if (response.data.success && response.data.contexts) {
                const contextTitles = response.data.contexts.map(ctx => ctx.contextTitle);
                

                if (contextTitles.length === 0) {
                    toast.info("No contexts associated with this post");
                    return;
                }

                // Create direct filter using context IDs (no session needed)
                const contextIds = response.data.contexts.map(ctx => ctx._id);
                // Construct the URL with direct context IDs
                const baseUrl = window.location.origin;
                const contextUrl = `${baseUrl}/contexts?filterContexts=${contextIds.join(',')}`;
                // Try to open the new tab
                try {
                    const newTab = window.open(contextUrl, '_blank');
                    
                    if (newTab && !newTab.closed) {
                        // Show a toast with the count
                        toast.success(`Opening ${contextTitles.length} context(s) in new tab`);
                    } else {
                        // Fallback: navigate in the same tab if popup was blocked
                        toast.info(`Found ${contextTitles.length} context(s). Click here to view them.`, {
                            onClick: () => window.location.href = contextUrl,
                            autoClose: 10000
                        });
                    }
                } catch (navError) {
                    console.error('Navigation error:', navError);
                    toast.error('Failed to open contexts. Please try again.');
                }
            } else {
                toast.info("No contexts associated with this post");
            }
        } catch (error) {
            console.error('Error fetching contexts for post:', error);
            toast.error("Failed to fetch contexts for this post");
        }
    };

    // Get current date in IST timezone
    const getCurrentDateInIST = () => {
        const now = new Date();
        const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // IST is UTC+5:30
        return istTime.toISOString().split('T')[0];
    };

    const currentDateInIST = getCurrentDateInIST();

    // Show loading spinner while data is being fetched
    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="post-list-container">
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '1px solid #e5e7eb'
            }}>
                <h1 style={{
                    fontSize: '1.5rem',
                    color: '#1a1a1a',
                    margin: 0,
                    fontFamily: 'Inter, Arial, sans-serif'
                }}>Posts Master</h1>
            </div>

            {/* Stats Card */}
            <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                margin: '20px 0',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '8px'
                }}>{allPosts.length}</div>
                <div style={{
                    fontSize: '1rem',
                    color: '#64748b',
                    fontWeight: '500'
                }}>Total Posts</div>
            </div>
            
            <div className="post-list-controls">
                <button className="add-post-btn" onClick={handleAddClick}>Add Post</button>
                <div className="date-range-controls">
                    <label>From: <input name="date" id="dateField" type="date" value={dateRange.start} onChange={e => setDateRange(r => ({ ...r, start: e.target.value }))} max={currentDateInIST} /></label>
                    <label>To: <input name="date" id="dateField" type="date" value={dateRange.end} onChange={e => setDateRange(r => ({ ...r, end: e.target.value }))} max={currentDateInIST} /></label>
                    <button className="download-csv-btn" onClick={handleDownloadCSV}>Download CSV</button>
                </div>
            </div>
            <div className="search-container">
                <input name="search..." id="search..." type="text" 
                    placeholder="Search..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="search-input"
                />
                <button className="search-btn" onClick={handleSearch}>Search</button>
            </div>
            <table className="post-table">
                <thead>
                    <tr>
                        <th onClick={() => requestSort("date")}>
                            Date {sortConfig.key === "date" && (sortConfig.direction === "ascending" ? "🔼" : "🔽")}
                        </th>
                        <th onClick={() => requestSort("postTitle")}>
                            Post Title {sortConfig.key === "postTitle" && (sortConfig.direction === "ascending" ? "🔼" : "🔽")}
                        </th>
                        <th onClick={() => requestSort("context")}>
                            Context {sortConfig.key === "context" && (sortConfig.direction === "ascending" ? "🔼" : "🔽")}
                        </th>
                        <th onClick={() => requestSort("postType")}>
                            Post Type {sortConfig.key === "postType" && (sortConfig.direction === "ascending" ? "🔼" : "🔽")}
                        </th>
                        <th onClick={() => requestSort("isTrending")}>
                            Is Trending {sortConfig.key === "isTrending" && (sortConfig.direction === "ascending" ? "🔼" : "🔽")}
                        </th>
                        <th>Actions</th>
                        <th>Show Contexts</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedPosts.length > 0 ? (
                        paginatedPosts.map((post) => (
                            <tr key={post._id}>
                                <td>{post.date ? new Date(post.date).toLocaleDateString() : ''}</td>
                                <td>{post.postTitle}</td>
                                <td>{resolveField(post.contexts, 'context')}</td>
                                <td>{post.postType}</td>
                                <td>{post.isTrending ? 'Yes' : 'No'}</td>
                                <td>
                                    <button className="edit-btn" onClick={() => handleEditClick(post._id)} disabled={userRole === 'User'}>✏️ Edit</button>
                                    <button className="remove-btn" onClick={() => handleRemoveClick(post._id, post.postTitle)} disabled={userRole === 'User'}>🗑️ Delete</button>
                                </td>
                                <td>
                                    <button 
                                        className="show-contexts-btn" 
                                        onClick={() => {
                                            handleShowPostContexts(post._id);
                                        }}
                                    >
                                        Show Post Contexts
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7">No posts found</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={handlePrevPage} disabled={currentPage === 1} style={{ padding: '0.5rem 1rem' }}>Previous</button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages} style={{ padding: '0.5rem 1rem' }}>Next</button>
            </div>
            
            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={handleCloseModal}
                onConfirm={confirmationModal.onConfirm}
                title={confirmationModal.title}
                message={confirmationModal.message}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    );
}

const styles = `
.pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
    padding: 1rem;
}

.pagination-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #fff;
    cursor: pointer;
    transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
    background-color: #f0f0f0;
}

.pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-info {
    font-size: 0.9rem;
    color: #666;
}
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
