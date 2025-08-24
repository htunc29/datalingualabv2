'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ClipLoader } from 'react-spinners';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  organization: string;
  researchArea: string;
  purpose: string;
  isApproved: boolean;
  isActive: boolean;
  isBanned?: boolean;
  banReason?: string;
  banDuration?: number;
  bannedAt?: string;
  bannedBy?: string;
  banExpiresAt?: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export default function UsersManagement() {
  const router = useRouter();
  const { admin, loading: authLoading, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'banned'>('pending');
  const [processingUser, setProcessingUser] = useState<string | null>(null);
  const [banModalUser, setBanModalUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    } else if (isAuthenticated) {
      fetchUsers();
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'approve' | 'reject') => {
    setProcessingUser(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        await fetchUsers(); // Refresh the list
      } else {
        alert('Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user status');
    } finally {
      setProcessingUser(null);
    }
  };

  const handleBanUser = async () => {
    console.log('handleBanUser called', { banModalUser, banReason, banDuration });
    
    if (!banModalUser || !banReason.trim()) {
      alert('Please provide a ban reason');
      return;
    }

    setProcessingUser(banModalUser._id);
    try {
      const requestBody = { 
        action: 'ban',
        banReason: banReason.trim(),
        banDuration: banDuration ? parseInt(banDuration) : null
      };
      
      console.log('Sending ban request:', requestBody);
      
      const response = await fetch(`/api/admin/users/${banModalUser._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const responseData = await response.json();
      console.log('Ban response:', { status: response.status, data: responseData });

      if (response.ok) {
        alert('User banned successfully');
        await fetchUsers();
        setBanModalUser(null);
        setBanReason('');
        setBanDuration('');
      } else {
        alert(`Failed to ban user: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Failed to ban user');
    } finally {
      setProcessingUser(null);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    if (!confirm('Are you sure you want to unban this user?')) return;

    setProcessingUser(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unban' })
      });

      if (response.ok) {
        await fetchUsers();
      } else {
        alert('Failed to unban user');
      }
    } catch (error) {
      console.error('Error unbanning user:', error);
      alert('Failed to unban user');
    } finally {
      setProcessingUser(null);
    }
  };

  const filteredUsers = users.filter(user => {
    switch (filter) {
      case 'pending':
        return !user.isApproved && user.isActive && !user.isBanned;
      case 'approved':
        return user.isApproved && user.isActive && !user.isBanned;
      case 'rejected':
        return !user.isActive && !user.isBanned;
      case 'banned':
        return user.isBanned;
      default:
        return true;
    }
  });

  const getStatusBadge = (user: User) => {
    if (user.isBanned) {
      const isExpired = user.banExpiresAt && new Date() > new Date(user.banExpiresAt);
      if (isExpired) {
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">⏰ Ban Expired</span>;
      }
      return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">🚫 Banned</span>;
    }
    if (!user.isActive) {
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Reddedildi / Rejected</span>;
    }
    if (user.isApproved) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Onaylandı / Approved</span>;
    }
    return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Beklemede / Pending</span>;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex justify-center items-center">
        <div className="text-center">
          <ClipLoader color="#3b82f6" size={50} />
          <p className="text-gray-600 mt-4 text-lg">Loading users...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-600 p-3 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
                <p className="text-gray-600 mt-1">User Management - {admin?.username}</p>
              </div>
            </div>
            
            <Link
              href="/admin"
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'pending' as const, label: 'Beklemede / Pending', count: users.filter(u => !u.isApproved && u.isActive && !u.isBanned).length },
              { key: 'approved' as const, label: 'Onaylanan / Approved', count: users.filter(u => u.isApproved && u.isActive && !u.isBanned).length },
              { key: 'rejected' as const, label: 'Reddedilen / Rejected', count: users.filter(u => !u.isActive && !u.isBanned).length },
              { key: 'banned' as const, label: '🚫 Yasaklı / Banned', count: users.filter(u => u.isBanned).length },
              { key: 'all' as const, label: 'Tümü / All', count: users.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  filter === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Kullanıcı bulunamadı</h3>
            <p className="text-gray-600">Seçili filtrede görüntülenecek kullanıcı yok.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user._id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-gray-600">{user.email}</p>
                      </div>
                      <div className="ml-auto">
                        {getStatusBadge(user)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Kurum / Organization:</span>
                        <p className="text-gray-600 mt-1">{user.organization}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Araştırma Alanı / Research Area:</span>
                        <p className="text-gray-600 mt-1">{user.researchArea}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">Kullanım Amacı / Purpose:</span>
                        <p className="text-gray-600 mt-1">{user.purpose}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Kayıt Tarihi / Registration Date:</span>
                        <p className="text-gray-600 mt-1">{new Date(user.createdAt).toLocaleDateString('tr-TR')}</p>
                      </div>
                      {user.approvedAt && (
                        <div>
                          <span className="font-medium text-gray-700">Onay Tarihi / Approval Date:</span>
                          <p className="text-gray-600 mt-1">{new Date(user.approvedAt).toLocaleDateString('tr-TR')}</p>
                        </div>
                      )}
                    </div>

                    {/* Ban Information */}
                    {user.isBanned && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-semibold text-red-800 mb-2">🚫 Ban Information</h4>
                        <div className="text-sm space-y-2">
                          <div>
                            <span className="font-medium text-gray-700">Reason:</span>
                            <p className="text-red-700">{user.banReason}</p>
                          </div>
                          {user.bannedAt && (
                            <div>
                              <span className="font-medium text-gray-700">Banned Date:</span>
                              <p className="text-gray-600">{new Date(user.bannedAt).toLocaleDateString('tr-TR')}</p>
                            </div>
                          )}
                          {user.banExpiresAt ? (
                            <div>
                              <span className="font-medium text-gray-700">Expires:</span>
                              <p className="text-orange-700">{new Date(user.banExpiresAt).toLocaleDateString('tr-TR')}</p>
                            </div>
                          ) : (
                            <div className="text-red-600 font-medium">Permanent Ban</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {user.isBanned ? (
                      <button
                        onClick={() => handleUnbanUser(user._id)}
                        disabled={processingUser === user._id}
                        className={`inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg transition-colors duration-200 min-w-[140px] ${
                          processingUser === user._id
                            ? 'bg-green-400 text-white cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {processingUser === user._id ? (
                          <>
                            <ClipLoader color="#ffffff" size={16} className="mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                            Yasağı Kaldır / Unban
                          </>
                        )}
                      </button>
                    ) : user.isApproved && user.isActive ? (
                      <button
                        onClick={() => setBanModalUser(user)}
                        className="inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg transition-colors duration-200 min-w-[140px] bg-purple-600 text-white hover:bg-purple-700"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                        </svg>
                        Yasakla / Ban User
                      </button>
                    ) : null}
                    
                    {!user.isApproved && user.isActive && !user.isBanned && (
                      <>
                        <button
                        onClick={() => handleUserAction(user._id, 'approve')}
                        disabled={processingUser === user._id}
                        className={`inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg transition-colors duration-200 min-w-[140px] ${
                          processingUser === user._id
                            ? 'bg-green-400 text-white cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {processingUser === user._id ? (
                          <>
                            <ClipLoader color="#ffffff" size={16} className="mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Onayla / Approve
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleUserAction(user._id, 'reject')}
                        disabled={processingUser === user._id}
                        className={`inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg transition-colors duration-200 min-w-[140px] ${
                          processingUser === user._id
                            ? 'bg-red-400 text-white cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        {processingUser === user._id ? (
                          <>
                            <ClipLoader color="#ffffff" size={16} className="mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reddet / Reject
                          </>
                        )}
                      </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ban User Modal */}
      {banModalUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">🚫 Ban User</h3>
                <button
                  onClick={() => setBanModalUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">User to Ban:</h4>
                  <p className="text-gray-700">{banModalUser.firstName} {banModalUser.lastName}</p>
                  <p className="text-gray-600 text-sm">{banModalUser.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ban Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows={3}
                    placeholder="Enter the reason for banning this user..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ban Duration (days)
                  </label>
                  <input
                    type="number"
                    value={banDuration}
                    onChange={(e) => setBanDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Leave empty for permanent ban"
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty for permanent ban, or specify days for temporary ban
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleBanUser}
                    disabled={!banReason.trim() || processingUser === banModalUser._id}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      !banReason.trim() || processingUser === banModalUser._id
                        ? 'bg-red-300 text-white cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {processingUser === banModalUser._id ? (
                      <>
                        <ClipLoader color="#ffffff" size={16} className="mr-2 inline" />
                        Banning...
                      </>
                    ) : (
                      'Ban User'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setBanModalUser(null);
                      setBanReason('');
                      setBanDuration('');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}