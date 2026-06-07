import React, { useState, useEffect, useContext } from 'react';
import axios from '../../config/axios';
import ContainerContext from '../../context/ContainerContext'; // Import the context for containers
import PostContext from '../../context/PostContext'; // Import the context for posts

export default function ContainerForm() {
    const { contexts = [], containers, isFormVisible, postsForContext, selectedContextId, setIsFormVisible } = useContext(ContainerContext);
    const { posts = [], setPosts } = useContext(PostContext);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [selectedType, setSelectedType] = useState(''); // Initialize as empty string
    const [loading, setLoading] = useState(true);

    // Fetch containerType from the database when the form is opened
    useEffect(() => {
        if (selectedContextId) {
            const fetchContext = async () => {
                try {
                    const response = await axios.get(`/api/admin/contexts/${selectedContextId}`, {
                        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                    });
                    const contextData = response.data;
                    setSelectedType(contextData.containerType || ''); // Set containerType or default to empty
                } catch (err) {
                    console.error('Error fetching context:', err);
                }
            };

            fetchContext();
        }
    }, [selectedContextId]);

    const getContextName = (id, data) => {
        const item = data.find(ele => ele._id === id);
        return item ? item.contextTitle : 'Unknown';
    };

    const contextTitle = getContextName(selectedContextId, contexts.data);

    // Update filteredPosts when postsForContext changes
    useEffect(() => {
        setFilteredPosts(postsForContext || []);
    }, [postsForContext]);

    // Handle change in the dropdown selection
    const handleTypeChange = (event) => {
        setSelectedType(event.target.value);
    };

    // Save updates to the database
    const handleSave = async () => {
        try {
            // Update posts with includeInContainer field
            await Promise.all(
                filteredPosts.map(post =>
                    axios.put(`/api/admin/posts/${post._id}`, { includeInContainer: post.includeInContainer }, {
                        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                    })
                )
            );
            // Update contexts with containerType field
            await axios.put(`/api/admin/contexts/${selectedContextId}`, { containerType: selectedType }, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
        } catch (err) {
            console.error('Error saving updates:', err);
        }
    };

    const handleHomeNav = () => {
        setIsFormVisible(false);
    };

    if (!isFormVisible) return null; // Return null if form is not visible

    return (
        <div className="container-form">
            <button type="button" className="submit-btn" onClick={handleHomeNav}>Container Home</button>
            <h2>
                Context: {contextTitle}
                <select id="field2zwzf" name="field2zwzf" 
                    value={selectedType} 
                    onChange={handleTypeChange}
                    style={{ marginLeft: '20px' }}
                >
                    <option value="Type-Five">Type-Five</option>
                    <option value="Type-Four">Type-Four</option>
                    <option value="Type-Three">Type-Three</option>
                    <option value="Type-Two">Type-Two</option>
                    <option value="Type-One">Type-One</option>
                    <option value="Type-Num">Type-Num</option>

                </select>
            </h2>
            <div className="post-list">
                <h3>Posts with Selected Context</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Post Title</th>
                            <th>Is Trending?</th>
                            <th>Include in Container?</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPosts.map(post => (
                            <tr key={post._id}>
                                <td>{post.postTitle}</td>
                                <td>{post.isTrending ? 'Yes' : 'No'}</td>
                                <td>
                                    <input id="fieldro9ma" name="fieldro9ma"
                                        type="checkbox"
                                        checked={post.includeInContainer || false}
                                        onChange={() => {
                                            setFilteredPosts(filteredPosts.map(p =>
                                                p._id === post._id ? { ...p, includeInContainer: !p.includeInContainer } : p
                                            ));
                                        }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={handleSave} style={{ marginTop: '20px' }}>Save</button>
        </div>
    );
}
