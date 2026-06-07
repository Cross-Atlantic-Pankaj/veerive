import React, { useContext, useEffect, useState } from 'react';
import PostContext from '../../context/PostContext';
import PostList from './PostList'; 
import PostForm from './PostForm'; 
import '../../html/css/Post.css';

const PostPage = () => {
    const { isFormVisible, handleFormSubmit, setIsFormVisible } = useContext(PostContext);
    const [formVisibility, setFormVisibility] = useState(
        localStorage.getItem("isFormVisible") === "true"
    );

    useEffect(() => {
        if (formVisibility) {
            setIsFormVisible(true);
        } else {
            setIsFormVisible(false);
            localStorage.removeItem("isFormVisible"); // ✅ Ensure it resets when on PostList
        }
    }, [formVisibility, setIsFormVisible]);

    const handleGoToPostList = () => {
        setIsFormVisible(false);
        localStorage.removeItem("isFormVisible"); // ✅ Reset when switching back
    };

    return (
        <div className="posts-container">
            {!isFormVisible ? (
                <PostList />
            ) : (
                <PostForm handleFormSubmit={handleFormSubmit} handleGoToPostList={handleGoToPostList} />
            )}
        </div>
    );
};

export default PostPage;
