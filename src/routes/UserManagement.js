import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blockingUser, setBlockingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.users);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (username, currentBlocked) => {
    try {
      setBlockingUser(username);
      await api.put(`/users/${encodeURIComponent(username)}/block`, {
        reason: currentBlocked ? 'Unblocked by admin' : 'Blocked by admin',
        expiry: currentBlocked ? 'now' : 'indefinite',
      });
      await fetchUsers();
    } catch (err) {
      alert(`Failed to ${currentBlocked ? 'unblock' : 'block'} user: ${err.message}`);
    } finally {
      setBlockingUser(null);
    }
  };

  const handleChangeRole = async (username, addGroups, removeGroups) => {
    try {
      await api.put(`/users/${encodeURIComponent(username)}/role`, {
        add: addGroups,
        remove: removeGroups,
        reason: 'Role changed by admin',
      });
      await fetchUsers();
    } catch (err) {
      alert(`Failed to change user role: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage users, roles, and permissions</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Groups
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Edit Count
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => {
              const isBlocked = user.groups?.includes('blocked') || false;
              const isAdmin = user.groups?.includes('sysop') || false;

              return (
                <tr key={user.id || user.username}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.username}</div>
                    {isBlocked && (
                      <div className="text-xs text-red-600">Blocked</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.groups && user.groups.length > 0 ? user.groups.join(', ') : 'user'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.editcount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleBlockUser(user.username, isBlocked)}
                      disabled={blockingUser === user.username}
                      className={`${
                        isBlocked
                          ? 'text-green-600 hover:text-green-900'
                          : 'text-red-600 hover:text-red-900'
                      } disabled:opacity-50`}
                    >
                      {blockingUser === user.username
                        ? '...'
                        : isBlocked
                        ? 'Unblock'
                        : 'Block'}
                    </button>
                    {!isAdmin && (
                      <button
                        onClick={() => handleChangeRole(user.username, ['sysop'], [])}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Make Admin
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => handleChangeRole(user.username, [], ['sysop'])}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        Remove Admin
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;

