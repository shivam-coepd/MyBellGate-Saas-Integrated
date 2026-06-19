import React, { useState, useEffect } from 'react';
import { Trash2, MessageSquare, Heart, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api';

interface Post {
  id: number;
  user_name: string;
  avatar_url?: string;
  unit?: string;
  content: string;
  image?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

const CommunityManagement: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getCommunityPosts({ limit: 100 });
      if (response.success && response.data) {
        // Handle paginated or direct response
        const dataArray = Array.isArray(response.data) ? response.data : (response.data as any).data || [];
        setPosts(dataArray);
      } else {
        throw new Error(response.message || 'Failed to load posts');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await apiClient.deleteCommunityPost(id);
      if (response.success) {
        setPosts(posts.filter(p => p.id !== id));
      } else {
        throw new Error(response.message || 'Failed to delete post');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete post');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b mb-6">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <span>Community Management</span>
            </h1>
            <p className="text-sm text-gray-500">{user?.society_name}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-sm text-blue-600 hover:underline"
            >
              ← Dashboard
            </button>
            <button onClick={logout} className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 text-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Posts</h2>
          <button 
            onClick={fetchPosts}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
          >
            Refresh Posts
          </button>
        </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-10">
          <div className="text-gray-500">Loading posts...</div>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white p-10 text-center rounded shadow">
          <div className="text-gray-500 text-lg">No community posts found.</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Media
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 overflow-hidden">
                        {post.avatar_url ? (
                          <img src={post.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          (post.user_name || 'User').charAt(0)
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{post.user_name || 'Unknown User'}</div>
                        <div className="text-sm text-gray-500">{post.unit || 'No unit'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 line-clamp-2 max-w-xs" title={post.content}>
                      {post.content}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {post.image ? (
                      <div className="text-blue-500 flex items-center" title="Has Image">
                        <ImageIcon size={18} className="mr-1" />
                        <span className="text-xs">Image</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Text only</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center"><Heart size={14} className="mr-1 text-red-400" /> {post.likes_count}</span>
                      <span className="flex items-center"><MessageSquare size={14} className="mr-1 text-blue-400" /> {post.comments_count}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Unknown date'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-red-600 hover:text-red-900 ml-4"
                      title="Delete Post"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
};

export default CommunityManagement;
