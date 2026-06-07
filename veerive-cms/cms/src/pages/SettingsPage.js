import React, { useState, useEffect, useContext } from "react";
import axios from "../config/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import styles from "../html/css/Settings.module.css";

const SettingsPage = () => {
    const [adminDetails, setAdminDetails] = useState({});
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const navigate = useNavigate();
    const { handleLogout } = useContext(AuthContext); 

    // Fetch admin details
    const fetchAdminDetails = async () => {
        try {
            const response = await axios.get("/api/users/account", {
                headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
            });
            setAdminDetails(response.data);
            setEmail(response.data.email);
        } catch (err) {
            console.error("Error fetching admin details:", err);
            toast.error("Failed to load admin details.");
        }
    };

    // Update email
    const handleUpdateEmail = async () => {
        if (!email.trim()) {
            toast.error("Email is required.");
            return;
        }
        
        setIsUpdatingEmail(true);
        try {
            await axios.put(
                "/api/users/update-email",
                { email },
                {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
                }
            );
            toast.success("Email updated successfully. Please log in again.");
            fetchAdminDetails();
            
            // Logout after email update for security
            setTimeout(() => {
                handleLogout();
            }, 2000);
        } catch (err) {
            console.error("Error updating email:", err);
            toast.error(err.response?.data?.message || "Failed to update email.");
        } finally {
            setIsUpdatingEmail(false);
        }
    };

    // Update password
    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword) {
            toast.error("Both current and new password are required.");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters long.");
            return;
        }
    
        setIsUpdatingPassword(true);
        try {
            const response = await axios.put(
                "/api/users/update-password",
                { currentPassword, newPassword },
                {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
                }
            );
    
            toast.success(response.data.message || "Password updated successfully. Please log in again.");
            setCurrentPassword("");
            setNewPassword("");
            sessionStorage.removeItem('token'); 
            
            // Log out user after password update for security
            setTimeout(() => {
                handleLogout();
            }, 2000);
        } catch (err) {
            console.error("Error updating password:", err);
            toast.error(err.response?.data?.message || "Failed to update password.");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    // Navigate back to Admin Home
    const handleBackToAdminHome = () => {
        navigate("/admin-home");
    };

    useEffect(() => {
        fetchAdminDetails();
    }, []);

    return (
        <div className={styles.settingsContainer}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Account Settings</h1>
            </div>

            {/* Admin Details Card */}
            <div className={styles.adminDetailsCard}>
                <h2 className={styles.cardTitle}>Admin Details</h2>
                <div className={styles.adminInfo}>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Full Name</span>
                        <span className={styles.infoValue}>{adminDetails.name || 'Not provided'}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Email Address</span>
                        <span className={styles.infoValue}>{adminDetails.email || 'Loading...'}</span>
                    </div>
                </div>
            </div>

            {/* Update Email Card */}
            <div className={styles.formCard}>
                <h2 className={`${styles.formTitle} ${styles.emailFormTitle}`}>Update Email Address</h2>
                <div className={styles.warningText}>
                    Changing your email will require you to log in again for security purposes.
                </div>
                
                <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.formLabel}>
                        New Email Address
                    </label>
                    <input name="emailField" id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.formInput}
                        placeholder="Enter your new email address"
                        disabled={isUpdatingEmail}
                        required
                    />
                </div>

                <div className={styles.buttonGroup}>
                    <button 
                        className={styles.primaryButton} 
                        onClick={handleUpdateEmail}
                        disabled={isUpdatingEmail || !email.trim()}
                    >
                        {isUpdatingEmail ? '📧 Updating...' : '📧 Update Email'}
                    </button>
                </div>
            </div>

            {/* Update Password Card */}
            <div className={styles.formCard}>
                <h2 className={`${styles.formTitle} ${styles.passwordFormTitle}`}>Change Password</h2>
                <div className={styles.securityNote}>
                    For your security, you'll be logged out after changing your password.
                </div>
                
                <div className={styles.formGroup}>
                    <label htmlFor="currentPassword" className={styles.formLabel}>
                        Current Password
                    </label>
                    <input name="passwordField" id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={styles.formInput}
                        placeholder="Enter your current password"
                        disabled={isUpdatingPassword}
                        autoComplete="current-password"
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="newPassword" className={styles.formLabel}>
                        New Password (minimum 6 characters)
                    </label>
                    <input name="passwordField" id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={styles.formInput}
                        placeholder="Enter your new password"
                        disabled={isUpdatingPassword}
                        autoComplete="new-password"
                        minLength={6}
                        required
                    />
                </div>

                <div className={styles.buttonGroup}>
                    <button 
                        className={styles.secondaryButton} 
                        onClick={handleUpdatePassword}
                        disabled={isUpdatingPassword || !currentPassword || !newPassword}
                    >
                        {isUpdatingPassword ? '🔒 Updating...' : '🔒 Update Password'}
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <div className={styles.formCard}>
                <div className={styles.buttonGroup}>
                    <button
                        className={styles.backButton}
                        onClick={handleBackToAdminHome}
                        disabled={isUpdatingEmail || isUpdatingPassword}
                    >
                        ← Back to Admin Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
