import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Copy, ExternalLink, Link as LinkIcon, Search } from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import api from '../../services/api';

interface PaymentLink {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    transactions: number;
  };
}

const PaymentLinks = () => {
  const { activeProject } = useProjects();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    slug: ''
  });

  useEffect(() => {
    if (activeProject) {
      fetchLinks();
    }
  }, [activeProject]);

  const fetchLinks = async () => {
    try {
      const response = await api.get(`/payment-links/project/${activeProject?.id}`);
      setLinks(response.data.data);
    } catch (error) {
      console.error('Failed to fetch links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/payment-links', {
        projectId: activeProject?.id,
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setShowCreateModal(false);
      setFormData({ title: '', description: '', amount: '', slug: '' });
      fetchLinks();
    } catch (error) {
      console.error('Failed to create link:', error);
      alert('Failed to create link. Slug might be taken.');
    }
  };

  const copyToClipboard = (slug: string) => {
    const url = `${window.location.origin}/pay/${slug}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const filteredLinks = links.filter(link => 
    link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Payment Links</h1>
          <p className="text-gray-400">Create and manage your payment pages</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={20} />
          Create Link
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search links..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-dark-card border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* Links Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading links...</div>
      ) : filteredLinks.length === 0 ? (
        <div className="text-center py-12 bg-dark-card rounded-xl border border-white/5">
          <LinkIcon className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No payment links yet</h3>
          <p className="text-gray-400 mb-6">Create your first payment link to start accepting payments without code.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            Create Link
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLinks.map((link) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-card rounded-xl p-6 border border-white/5 hover:border-primary/20 transition-colors group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <LinkIcon size={24} />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(link.slug)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    title="Copy Link"
                  >
                    <Copy size={18} />
                  </button>
                  <a
                    href={`/pay/${link.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    title="Open Link"
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-1">{link.title}</h3>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">{link.description || 'No description'}</p>

              <div className="flex justify-between items-end border-t border-white/5 pt-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Amount</p>
                  <p className="text-xl font-bold text-white">
                    {link.currency} {link.amount.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Transactions</p>
                  <p className="text-sm font-medium text-white">{link._count.transactions}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-bg border border-white/10 rounded-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-white mb-4">Create Payment Link</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-card border border-white/10 rounded-lg text-white focus:border-primary/50 outline-none"
                  placeholder="e.g. Red Shoes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-card border border-white/10 rounded-lg text-white focus:border-primary/50 outline-none"
                  placeholder="Optional description..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Amount (KES)</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-card border border-white/10 rounded-lg text-white focus:border-primary/50 outline-none"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Custom URL Slug</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-white/10 bg-white/5 text-gray-400 text-sm">
                    /pay/
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="flex-1 px-3 py-2 bg-dark-card border border-white/10 rounded-r-lg text-white focus:border-primary/50 outline-none"
                    placeholder="my-product"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create Link
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PaymentLinks;
