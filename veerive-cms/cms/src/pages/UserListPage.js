import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { toast } from "react-toastify";
import AuthContext from "../context/AuthContext";
import AlertComponent from '../components/AlertComponent';
import ConfirmationModal from '../components/ConfirmationModal';
import styles from '../html/css/UserList.module.css';

const UserManagementPage = () => {
  const { state } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'User', name: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [alertState, setAlertState] = useState({ open: false, message: '', severity: 'success' });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    itemToDelete: null
  });

  // Fetch users from the backend
  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users/list", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError("Failed to load user list.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (error) console.error(error);
    if (success) console.log(success);
  }, [error, success]);

  // Only SuperAdmin can access
  if (!state.user || state.user.role !== 'SuperAdmin') {
    return (
      <div className={styles.contentContainer}>
        <div className={styles.accessDenied}>
          Access denied. Only SuperAdmin can manage users.
        </div>
      </div>
    );
  }

  // Handle user creation
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!newUser.email || !newUser.password || !newUser.role) {
      setError('Email, password, and role are required.');
      return;
    }

    if (newUser.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsCreatingUser(true);
    try {
      const response = await axios.post('/api/users/register', newUser, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSuccess('User created successfully!');
      setNewUser({ email: '', password: '', role: 'User', name: '' });
      fetchUsers();
      toast.success('User created successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create user.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Handle edit user
  const handleEditClick = (user) => {
    setEditingUser({
      _id: user._id,
      name: user.name || '',
      email: user.email,
      role: user.role,
      password: '' // Empty for edit mode
    });
  };

  // Handle edit user submission
  const handleEditUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!editingUser.email || !editingUser.role) {
      setError('Email and role are required.');
      return;
    }

    if (editingUser.password && editingUser.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsEditingUser(true);
    try {
      const updateData = {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role
      };

      // Only include password if it's provided
      if (editingUser.password) {
        updateData.password = editingUser.password;
      }

      const response = await axios.put(`/api/users/update/${editingUser._id}`, updateData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      setSuccess('User updated successfully!');
      setEditingUser(null);
      fetchUsers();
      toast.success('User updated successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update user.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsEditingUser(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingUser(null);
    setError('');
    setSuccess('');
  };

  // Handle role change
  const handleRoleChange = async (userId, newRole) => {
    if (newRole === 'SuperAdmin') return; // Prevent assigning SuperAdmin
    try {
      await axios.put(`/api/users/change-role/${userId}`, { role: newRole }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAlertState({ open: true, message: 'Role updated successfully.', severity: 'success' });
      fetchUsers();
    } catch (err) {
      setAlertState({ open: true, message: 'Failed to update role.', severity: 'error' });
    }
  };

  // Handle user deletion
  const handleDeleteClick = (userId, userName, userEmail) => {
    if (userEmail === 'info@veerive.com') return; // Prevent deleting SuperAdmin
    setConfirmationModal({
      isOpen: true,
      title: 'Delete User',
      message: `Are you sure you want to delete user "${userName || userEmail}"? This action cannot be undone.`,
      onConfirm: () => handleDeleteAccount(userId, userEmail),
      itemToDelete: userId
    });
  };

  const handleDeleteAccount = async (userId, userEmail) => {
    try {
      await axios.delete(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAlertState({ open: true, message: 'User deleted successfully.', severity: 'success' });
      fetchUsers();
    } catch (err) {
      setAlertState({ open: true, message: 'Failed to delete user.', severity: 'error' });
    } finally {
      setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleCloseModal = () => {
    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
  };

  if (loading) {
    return (
      <div className={styles.contentContainer}>
        <div className={styles.loadingContainer}>Loading users...</div>
      </div>
    );
  }

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.contentContainer}>
      <div className={styles.pageHeader}>
        <h2>User Management</h2>
      </div>

      {/* Stats Card */}
      <div className={styles.statsCard}>
        <div className={styles.statsNumber}>{users.length}</div>
        <div className={styles.statsLabel}>Total Users</div>
      </div>

      {/* Create User Form */}
      <div className={styles.createUserCard}>
        <h3 className={styles.createUserTitle}>Create New User/Admin</h3>
        <form onSubmit={handleCreateUser} className={styles.createUserForm}>
          <input name="fullname(optional)" id="fullname(optional)" type="text"
            placeholder="Full Name (Optional)"
            value={newUser.name}
            onChange={e => setNewUser({ ...newUser, name: e.target.value })}
            className={styles.formInput}
            disabled={isCreatingUser}
          />
          <input name="emailaddress*" id="emailaddress*" type="email"
            placeholder="Email Address *"
            value={newUser.email}
            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
            className={styles.formInput}
            required
            disabled={isCreatingUser}
          />
          <input name="password(min6chars)*" id="password(min6chars)*" type="password"
            placeholder="Password (min 6 chars) *"
            value={newUser.password}
            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
            className={styles.formInput}
            required
            minLength={6}
            disabled={isCreatingUser}
          />
          <select name="select" id="selectField" value={newUser.role}
            onChange={e => setNewUser({ ...newUser, role: e.target.value })}
            className={styles.formSelect}
            required
            disabled={isCreatingUser}
          >
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
          <button 
            type="submit" 
            className={styles.createButton}
            disabled={isCreatingUser}
          >
            {isCreatingUser ? '⏳ Creating...' : '➕ Create User'}
          </button>
        </form>
        {error && <AlertComponent open={!!error} message={error} severity="error" onClose={() => setError('')} />}
        {success && <AlertComponent open={!!success} message={success} severity="success" onClose={() => setSuccess('')} />}
      </div>

      {/* Edit User Form */}
      {editingUser && (
        <div className={styles.createUserCard} style={{ backgroundColor: '#f0f8ff', border: '2px solid #4CAF50' }}>
          <h3 className={styles.createUserTitle}>Edit User</h3>
          <form onSubmit={handleEditUser} className={styles.createUserForm}>
            <input name="fullname(optional)" id="fullname(optional)" type="text"
              placeholder="Full Name (Optional)"
              value={editingUser.name}
              onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
              className={styles.formInput}
              disabled={isEditingUser}
            />
            <input name="emailaddress*" id="emailaddress*" type="email"
              placeholder="Email Address *"
              value={editingUser.email}
              onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
              className={styles.formInput}
              required
              disabled={isEditingUser}
            />
            <input name="newpassword(leaveblanktokeepcurrent)" id="newpassword(leaveblanktokeepcurrent)" type="password"
              placeholder="New Password (leave blank to keep current)"
              value={editingUser.password}
              onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
              className={styles.formInput}
              disabled={isEditingUser}
            />
            <select name="select" id="selectField" value={editingUser.role}
              onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
              className={styles.formSelect}
              required
              disabled={isEditingUser}
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="submit" 
                className={styles.createButton}
                disabled={isEditingUser}
              >
                {isEditingUser ? '⏳ Updating...' : '💾 Update User'}
              </button>
              <button 
                type="button" 
                onClick={handleCancelEdit}
                className={styles.cancelButton}
                disabled={isEditingUser}
              >
                ❌ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input name="searchbynameoremail..." id="searchbynameoremail..." type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className={styles.emptyMessage}>
          {search ? `No users found matching "${search}"` : 'No users found'}
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name || 'Not provided'}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.email === 'info@veerive.com' ? (
                      <strong>SuperAdmin</strong>
                    ) : (
                      <select name="select" id="selectField" value={user.role}
                        onChange={e => handleRoleChange(user._id, e.target.value)}
                        disabled={user.email === 'info@veerive.com' || !(state.user.role === 'Admin' || state.user.role === 'SuperAdmin')}
                        className={styles.roleSelect}
                      >
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                      </select>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {user.email !== 'info@veerive.com' && (state.user.role === 'Admin' || state.user.role === 'SuperAdmin') && (
                        <>
                          <button
                            className={`${styles.actionButton} ${styles.editButton}`}
                            onClick={() => handleEditClick(user)}
                            disabled={editingUser !== null}
                          >
                            ✏️ Edit
                          </button>
                      <button
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={() => handleDeleteClick(user._id, user.name, user.email)}
                            disabled={editingUser !== null}
                      >
                        🗑️ Delete
                      </button>
                        </>
                    )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AlertComponent 
        open={alertState.open} 
        message={alertState.message} 
        severity={alertState.severity} 
        onClose={() => setAlertState({ ...alertState, open: false })} 
      />
      
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
};

export default UserManagementPage;
