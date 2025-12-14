import { useState } from 'react';
import { useUsers } from '../../hooks/useUsers';
import { SquarePen, Trash2, User, Search, Filter } from 'lucide-react'; // Added User, Search, Filter icons
import UserModal from '../../components/modals/UserModal';

export default function Users() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const limit = 10;

  const { usersQuery } = useUsers({ role, page, limit, search, sort, order: 'desc' });

  const users = usersQuery.data?.users || [];
  const pagination = usersQuery.data?.pagination || {};
  const isLoading = usersQuery.isLoading;

  const openModal = (user) => {
    setSelectedUser(user || null);
    setModalOpen(true);
  };

  // Helper to get avatar URL
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath || avatarPath === 'null') return null;
    return avatarPath.startsWith('http')
      ? avatarPath
      : `${import.meta.env.VITE_API_URL}${avatarPath}`;
  };

  return (
    <div className="w-[90%] max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text">Truck List</h2>
          <p className="mt-1 text-muted">Manage your truck fleet and drivers</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition font-semibold shadow-md flex items-center gap-2"
        >
          <User size={20} />
          <span>Add User</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface rounded-xl p-4 mb-6 shadow-sm border border-border grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

        {/* Search */}
        <div className="md:col-span-5 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-background text-text rounded-lg border border-border focus:outline-none focus:ring-2 focus:border-primary transition-all"
          />
        </div>

        {/* Role Filter */}
        <div className="md:col-span-3 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <select
            value={role}
            onChange={(e) => {
              setPage(1);
              setRole(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-background text-text rounded-lg border border-border focus:outline-none focus:ring-2 focus:border-primary appearance-none cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="driver">Driver</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Sort */}
        <div className="md:col-span-4">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full px-4 py-2.5 bg-background text-text rounded-lg border border-border focus:outline-none focus:ring-2 focus:border-primary cursor-pointer"
          >
            <option value="createdAt">Sort by Date</option>
            <option value="fullname">Sort by Name</option>
            <option value="email">Sort by Email</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-surface rounded-xl shadow-md overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-center font-semibold text-sm uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {isLoading && (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-muted animate-pulse">
                    Loading users data...
                  </td>
                </tr>
              )}

              {!isLoading && users.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-muted flex flex-col items-center justify-center gap-2">
                    <User size={48} className="opacity-20" />
                    <span>No users found matching your criteria</span>
                  </td>
                </tr>
              )}

              {users.map((user) => {
                const avatarUrl = getAvatarUrl(user.avatar);

                return (
                  <tr key={user._id} className="hover:bg-background/50 transition-colors duration-150">
                    {/* User Column with Avatar */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          {avatarUrl ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover border border-border"
                              src={avatarUrl}
                              alt=""
                              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                            />
                          ) : null}
                          {/* Fallback Icon */}
                          <div
                            style={{ display: avatarUrl ? 'none' : 'flex' }}
                            className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center text-muted"
                          >
                            <User size={20} />
                          </div>
                        </div>
                        <div className="text-sm font-medium text-text">{user.fullname}</div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-muted">
                      {user.email}
                    </td>

                    {/* Role Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize bg-background border border-border
                        ${user.role === 'admin'
                          ? 'text-secondary'
                          : 'text-primary'}`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => openModal(user)}
                          className="text-muted hover:text-primary transition-colors p-1 rounded-md hover:bg-background"
                          title="Edit User"
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          className="text-muted hover:text-red-500 transition-colors p-1 rounded-md hover:bg-background"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface">
            <p className="text-sm text-muted">
              Page <span className="font-medium text-text">{pagination.page}</span> of <span className="font-medium text-text">{pagination.totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                disabled={pagination.page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 text-sm font-medium bg-background border border-border text-text rounded-lg hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 text-sm font-medium bg-primary text-white border border-transparent rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        userToEdit={selectedUser}
      />
    </div>
  );
}