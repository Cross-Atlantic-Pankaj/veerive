import React, { useState, useEffect } from 'react';
import axios from '../../config/axios'; // Ensure correct API path
import '../../html/css/StoryComponent.css'; // Import CSS

export default function StoryOrder() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [posts, setPosts] = useState([]);
    const [contexts, setContexts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [publishDate, setPublishDate] = useState('');
    const [rank, setRank] = useState({});
    const [filteredContextsState, setFilteredContextsState] = useState([]); // ✅ Separate filtered contexts

    // ✅ Add Pagination State Here
    const [currentPage, setCurrentPage] = useState(1);
    const contextsPerPage = 10; // ✅ Show 10 contexts per page

    // ✅ Calculate which contexts to display on the current page
    const indexOfLastContext = currentPage * contextsPerPage;
    const indexOfFirstContext = indexOfLastContext - contextsPerPage;
    const currentContexts = filteredContextsState.slice(indexOfFirstContext, indexOfLastContext);
   
    useEffect(() => {
        // Retrieve stored state on mount
        const storedStartDate = localStorage.getItem('startDate');
        const storedEndDate = localStorage.getItem('endDate');
        const storedPage = localStorage.getItem('currentPage');
    
        if (storedStartDate) setStartDate(storedStartDate);
        if (storedEndDate) setEndDate(storedEndDate);
        if (storedPage) setCurrentPage(parseInt(storedPage));

    }, []);
    
  useEffect(() => {
        if (posts.length > 0) { 
            fetchContexts();  // ✅ Always fetch new contexts when posts change
        }
    }, [posts]); 
    
    useEffect(() => {
        if (contexts.length > 0 && filteredContextsState.length === 0) {
            fetchStoryOrders();
        }
    }, [contexts]); // ✅ Runs only once when contexts change
    
    const handlePageChange = (page) => {
        setCurrentPage(page);
        localStorage.setItem('currentPage', page); // ✅ Store current page in localStorage
    };

    // Handle changes in rank input fields
    const handleRankChange = (contextTitle, value) => {
        setRank(prevRank => ({
            ...prevRank,
            [contextTitle]: value
        }));
    };

    // Handle date selection
    const handleDateChange = (e) => {
        const { name, value } = e.target;
        if (name === 'startDate') {
            setStartDate(value);
        } else if (name === 'endDate') {
            setEndDate(value);
        }
    };

    const handlePublishDateChange = (e) => {
        setPublishDate(e.target.value);
    };

    const fetchPosts = async () => {
        if (!startDate || !endDate) {
            alert("⚠️ Please select start and end dates before fetching.");
            return;
        }
    
        setLoading(true);
        setPublishDate('');
        setContexts([]);  // ✅ Clear previous contexts to prevent old data from showing.
        setPosts([]);  // ✅ Clear previous posts before fetching
        setFilteredContextsState([]); // ✅ Clear previous contexts before fetching
        
        try {
            const response = await axios.get('/api/admin/posts/all', {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
    
            if (response.data.success) {
                // ✅ Manually filter posts by date
                const filteredPosts = response.data.posts.filter(post => {
                    const postDate = new Date(post.date); // Ensure post.date is a Date object
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999); // Include full end day
    
                    return postDate >= start && postDate <= end; // ✅ Keep only posts in range
                });
                setPosts(filteredPosts);
                // ✅ Store in `localStorage` to persist after reload
            localStorage.setItem('startDate', startDate);
            localStorage.setItem('endDate', endDate);
            }
        } catch (err) {
            console.error('❌ Error fetching all posts:', err);
        } finally {
            setLoading(false);
        }
    };
    
    const fetchContexts = async () => {
        if (posts.length === 0) return;
    
        setLoading(true);
        setFilteredContextsState([]); // ✅ Reset displayed contexts when fetching new ones

        let allContexts = [];
        let currentPage = 1;
        const limit = 999;
        let totalPages = 1;
    
        const postIds = posts.map(post => post._id); // ✅ Get all post IDs
    
        try {
            do {
                const response = await axios.get('/api/admin/contexts/all', {
                    params: { postIds, page: currentPage, limit },
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                });
    
                if (Array.isArray(response.data.contexts)) {
                    allContexts = [...allContexts, ...response.data.contexts];
                }
    
                totalPages = response.data.totalPages;
                currentPage++;
            } while (currentPage <= totalPages);
            // ✅ Only keep contexts that are linked to fetched posts
            const filteredContexts = allContexts.filter(context =>
                context.posts.some(p => postIds.includes(p.postId))
            );
            setContexts(filteredContexts);
        } catch (err) {
            console.error('❌ Error fetching all contexts:', err);
            setContexts([]);
        } finally {
            setLoading(false);
        }
    };
  
    const fetchStoryOrders = async () => {
        if (contexts.length === 0) return; // Ensure contexts exist before running
    
        setLoading(true);
        setPublishDate(''); // Reset publish date before fetching new data
    
        try {
            const response = await axios.get('/api/admin/story-orders', {
                params: { startDate, endDate },
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
    
            const orders = response.data;
            // ✅ Extract contexts that are linked to posts
            const postLinkedContextIds = contexts
                .filter(ctx => ctx.posts.some(p => posts.some(post => post._id === p.postId)))
                .map(ctx => ctx._id);
    
            // ✅ Extract valid contexts from story orders (contexts with a rank)
            const validContextIds = [...new Set(orders.map(order => order.contextId))];
    
            // ✅ Include contexts that are in valid story orders OR linked to posts
            const newFilteredContexts = contexts.filter(ctx => 
                validContextIds.includes(ctx._id) || postLinkedContextIds.includes(ctx._id)
            );
            setFilteredContextsState(newFilteredContexts); // ✅ Update state with filtered contexts
    
            // ✅ Set the latest publish date if available
            // if (orders.length > 0) {
            //     const latestPublishDate = orders
            //         .map(order => new Date(order.publishDate))
            //         .sort((a, b) => b - a)[0];
    
            //     setPublishDate(latestPublishDate.toISOString().split('T')[0]);
            // } else {
            //     setPublishDate('');
            // }
    
            // ✅ Set Rank for contexts that exist in `newFilteredContexts`
            const newRank = {};
            orders.forEach(order => {
                const context = newFilteredContexts.find(ctx => ctx._id === order.contextId);
                if (context) {
                    newRank[context.contextTitle] = order.rank;
                }
            });
    
            setRank(newRank);
        } catch (err) {
            console.error('❌ Error fetching story orders:', err);
        } finally {
            setLoading(false);
        }
    };
    
    const handleSave = async () => {
        if (!publishDate || !startDate || !endDate) {
            alert("⚠️ Please select a publish date, start date, and end date.");
            return;
        }
    
        try {
            const existingOrdersResponse = await axios.get('/api/admin/story-orders', {
                params: { startDate, endDate, publishDate },
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            const existingOrders = existingOrdersResponse.data;
    
            const storyOrders = Object.entries(rank).map(([contextTitle, contextRank]) => {
                const context = contexts.find(context => context.contextTitle === contextTitle);
                if (!context) return null;
    
                const existingOrder = existingOrders.find(order =>
                    order.contextId.toString() === context._id.toString() &&
                    new Date(order.publishDate).toISOString() === new Date(publishDate).toISOString()
                );
    
                return {
                    publishDate: new Date(publishDate).toISOString(),
                    contextId: context._id,
                    rank: contextRank,
                    _id: existingOrder ? existingOrder._id : null
                };
            }).filter(Boolean);
            await Promise.all(storyOrders.map(async order => {
                if (order._id) {
                    await axios.put(`/api/admin/story-orders/${order._id}`, {
                        publishDate: new Date(order.publishDate).toISOString(),
                        contextId: order.contextId,
                        rank: parseInt(order.rank)
                    }, {
                        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                    });
                } else {
                    await axios.post('/api/admin/story-orders', {
                        publishDate: order.publishDate,
                        contextId: order.contextId,
                        rank: order.rank
                    }, {
                        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                    });
                }
            }));
            // ✅ Clear the publish date after saving
            setPublishDate('');
            alert("✅ Story Orders Saved Successfully!");
    
            fetchStoryOrders(); // ✅ Refresh Story Orders
    
        } catch (err) {
            console.error('❌ Error saving story orders:', err);
        }
    };
    
  const contextMap = (Array.isArray(filteredContextsState) ? filteredContextsState : []).reduce((acc, context) => {
        if (context.posts && Array.isArray(context.posts)) {
            const postTitles = posts
                .filter(post => context.posts.some(p => p.postId === post._id))
                .map(post => post.postTitle);
    
            if (postTitles.length > 0) {
                acc[context.contextTitle] = {
                    postTitles,
                    isTrending: context.isTrending,
                    rank: rank[context.contextTitle] || ''
                };
            }
        }
        return acc;
    }, {});
    useEffect(() => {
        // Clear stored start and end dates when navigating to the page
        localStorage.removeItem('startDate');
        localStorage.removeItem('endDate');
        localStorage.removeItem('currentPage');
    
        // Reset state to empty values
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
    }, []);

    return (
        <div className="story-order-container">
            <h1>Story Order</h1>

            <div className="form-controls">
                <label>Start Date: <input id="dateField" type="date" name="startDate" value={startDate} onChange={handleDateChange} /></label>
                <label>End Date: <input id="dateField" type="date" name="endDate" value={endDate} onChange={handleDateChange} /></label>
                <button onClick={fetchPosts} disabled={loading}>
                    {loading ? 'Loading...' : 'Fetch Posts'}
                </button>
            </div>
            <br/>
            <br/>
            <div className="summary">
                    <h3>Total Posts: {posts.length}</h3>
                    <h3>Total Contexts: {contexts.length}</h3>
                    <h3>Displayed Contexts: {filteredContextsState.length}</h3> 
                </div>

            {posts.length > 0 && contexts.length > 0 ? (
                <div className="table-container">
                    <h2>Context and Posts</h2>
                    <label>
                        Publish Date:
                        <input id="dateField" type="date" name="publishDate" value={publishDate} onChange={handlePublishDateChange} />
                        <br/>
                        <br/>
                        <button onClick={handleSave} className="save-btn">Save</button>
                    </label>
                    <br/>
                    <br/>
                    <table>
                        <thead>
                            <tr><th>Context Title</th><th>Post Titles</th><th>Trending?</th><th>Rank</th></tr>
                        </thead>
                        {/* <tbody>
                            {Object.entries(contextMap).map(([contextTitle, { postTitles, isTrending, rank }]) => (
                                <tr key={contextTitle} className={isTrending ? 'trending-context' : ''}>
                                    <td>{contextTitle}</td>
                                    <td>{postTitles.join(', ')}</td>
                                    <td>{isTrending ? 'Yes' : 'No'}</td>
                                    <td><input type="number" value={rank || ''} onChange={(e) => handleRankChange(contextTitle, e.target.value)} /></td>
                                </tr>
                            ))}
                        </tbody> */}
                        <tbody>
                                                {Object.entries(contextMap)
                                    .slice(indexOfFirstContext, indexOfLastContext) // ✅ Apply pagination here
                                    .map(([contextTitle, { postTitles, isTrending, rank }]) => (
                                        <tr key={contextTitle} className={isTrending ? 'trending-context' : ''}>
                                            <td>{contextTitle}</td>
                                            <td>{postTitles.join(', ')}</td>
                                            <td>{isTrending ? 'Yes' : 'No'}</td>
                                            <td>
                                                <input 
                                                    type="number" 
                                                    value={rank || ''} 
                                                    onChange={(e) => handleRankChange(contextTitle, e.target.value)} 
                                                />
                                            </td>
                                        </tr>
                                    ))}
                        </tbody>
                        </table>
                    
                {/* Pagination Controls */}
                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            {Array.from({ length: Math.ceil(filteredContextsState.length / contextsPerPage) }).map((_, index) => (
                                <button 
                                    key={index} 
                                    onClick={() => handlePageChange(index + 1)}
                                    style={{
                                        padding: '8px 12px',
                                        margin: '5px',
                                        border: '1px solid #007bff',
                                        backgroundColor: currentPage === index + 1 ? '#007bff' : 'white',
                                        color: currentPage === index + 1 ? 'white' : '#007bff',
                                        borderRadius: '5px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>

                    </div>
            ) : (
                <p className="no-data">No posts available for the selected date range.</p>
            )}
        </div>
    );
}
