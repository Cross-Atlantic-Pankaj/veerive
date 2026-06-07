import React, { useContext, useState, useMemo } from 'react';
import ContainerContext from '../../context/ContainerContext';
import axios from '../../config/axios';
import '../../html/css/Container.css';

export default function ContainerList() {
    const { containers, containersDispatch, handleAddClick, handleEditClick, contexts, setPostsForContext, handleShowClick } = useContext(ContainerContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'postTitle', direction: 'ascending' });
    const [selectedContainer, setSelectedContainer] = useState(null);
    const [loadingContexts, setLoadingContexts] = useState(false); // New loading state
    // Helper functions
    const getContextName = (ids, data) => {
        if (!Array.isArray(ids)) return 'Unknown';
        const contextNames = ids.map(id => {
            const item = data ? data.find(ele => ele._id === id) : null;
            return item ? item.contextTitle : 'Unknown';
        });
        return contextNames.join(', ');
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedContainers = useMemo(() => {
        if (!containers || !containers.data) return [];

        let sortableContainers = [...containers.data];

        if (sortConfig !== null) {
            sortableContainers.sort((a, b) => {
                let aValue, bValue;

                switch (sortConfig.key) {
                    case 'postTitle':
                    case 'containerType':
                        aValue = a[sortConfig.key].toLowerCase();
                        bValue = b[sortConfig.key].toLowerCase();
                        break;
                    case 'date':
                        aValue = new Date(a.date);
                        bValue = new Date(b.date);
                        break;
                    case 'context':
                        aValue = getContextName(a.context, contexts ? contexts.data : []).toLowerCase();
                        bValue = getContextName(b.context, contexts ? contexts.data : []).toLowerCase();
                        break;
                    default:
                        aValue = a[sortConfig.key];
                        bValue = b[sortConfig.key];
                        break;
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableContainers;
    }, [containers, sortConfig, contexts]);

    const filteredContainers = sortedContainers.filter(container =>
        (container.postTitle || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearch = () => {
        // Perform additional logic on search if needed
    };

    const handleShow = async (container) => {
        if (!contexts) {
            console.error('Contexts data is not available.');
            return;
        }
        // Ensure that selectedContainer is updated correctly before showing the form
        setSelectedContainer(container);
        // Call handleShowClick which should trigger the update of context or postsForContext
        await handleShowClick(container);
    };

    return (
        <div className="container-list-container">
            <div className="search-container">
                <input name="search..." id="search..." type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
                <button className="search-btn" onClick={handleSearch}>Search</button>
            </div>
            <table className="container-table">
                <thead>
                    <tr>
                        <th onClick={() => requestSort('postTitle')}>
                            Post Title {sortConfig.key === 'postTitle' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th onClick={() => requestSort('date')}>
                            Date {sortConfig.key === 'date' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th onClick={() => requestSort('isTrending')}>
                            Is Trending {sortConfig.key === 'isTrending' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th onClick={() => requestSort('context')}>
                            Context {sortConfig.key === 'context' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th onClick={() => requestSort('containerType')}>
                            Container Type {sortConfig.key === 'containerType' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}
                        </th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredContainers.map(container => (
                        <tr key={container._id}>
                            <td>{container.postTitle}</td>
                            <td>{container.date}</td>
                            <td>{container.isTrending ? 'Yes' : 'No'}</td>
                            <td>{contexts ? getContextName(container.context, contexts.data) : 'Unknown'}</td>
                            <td>
                                <button
                                    className="show-btn"
                                    onClick={() => handleShow(container)}
                                    disabled={loadingContexts} // Disable while loading
                                >
                                    Show
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
