import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { updateProfile, sendOTP } from '../services/api';
import toast from 'react-hot-toast';
import { Mail, User, Info, CheckCircle, AlertTriangle, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const Profile = () => {
  const { user, loadUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', bio: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', bio: user.bio || '' });
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Single "Save Changes" call — uploads avatar + text fields together
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('bio', formData.bio);
      if (selectedFile) {
        payload.append('avatar', selectedFile);
      }
      await updateProfile(payload);
      toast.success('Profile updated successfully');
      setSelectedFile(null);
      setPreviewUrl(null);
      await loadUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await sendOTP();
      toast.success('OTP sent to your email!');
      navigate('/verify-otp', { state: { fromProfile: true } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  // Resolve the avatar display URL
  // Cloudinary URLs are full https:// paths, use directly
  const getAvatarSrc = () => {
    if (previewUrl) return previewUrl;
    return user?.profilePic || null;
  };

  if (!user) return null;
  const avatarSrc = getAvatarSrc();

  return (
    <div className="max-w-2xl mx-auto py-8 transition-all animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-8 sm:p-10">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            {user.isVerified ? (
              <span className="flex items-center text-sm font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                <CheckCircle className="w-4 h-4 mr-1.5" /> Verified
              </span>
            ) : (
              <span className="flex items-center text-sm font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                <AlertTriangle className="w-4 h-4 mr-1.5" /> Unverified
              </span>
            )}
          </div>

          {/* Avatar — click to select, saved with the form */}
          <div className="flex flex-col items-center mb-10">
            <div 
              className="relative w-28 h-28 rounded-full border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarSrc ? (
                <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-primary-600 font-bold text-4xl">
                  {formData.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Pencil className="w-6 h-6 text-white" />
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
            <p className="text-xs text-gray-400 mt-3 font-semibold uppercase tracking-wider">
              {selectedFile ? selectedFile.name : 'Tap to change avatar'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <User className="w-4 h-4" /> Full Name
              </label>
              <input
                type="text" name="name" value={formData.name} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-4 h-4" /> Email Address
              </label>
              <div className="flex gap-3">
                <input type="email" value={user.email || ''} disabled
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                />
                {!user.isVerified && (
                  <button type="button" onClick={handleVerifyEmail}
                    className="shrink-0 px-5 py-2 bg-amber-100 text-amber-700 hover:bg-amber-200 font-semibold rounded-xl transition-colors"
                  >Verify</button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <Info className="w-4 h-4" /> Bio
              </label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3}
                placeholder="Tell us a bit about yourself..."
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none"
              />
            </div>

            <div className="pt-6 border-t border-gray-100">
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
