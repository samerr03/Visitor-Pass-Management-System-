import { useState, useEffect } from 'react';
import api from '../api/axios';

const StaffProfile = () => {
    const [user, setUser] = useState(null);
    const [passwordData, setPasswordData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/profile');

            setUser(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.password !== passwordData.confirmPassword) {
            setMsg('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await api.put('/auth/update-password', { password: passwordData.password });
            setMsg('Password updated successfully');
            setPasswordData({ password: '', confirmPassword: '' });
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            console.error(err);
            setMsg(err.response?.data?.message || 'Error updating password');
        } finally {
            setLoading(false);
        }
    };

    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const handlePhotoUpload = async () => {
        if (!photoFile) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('photo', photoFile);

        try {
            const res = await api.patch('/auth/profile/photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMsg('Photo updated successfully');
            // Update user state with new photo URL
            setUser(prev => ({ ...prev, photo: res.data.photo, photoUrl: res.data.photoUrl }));
            setPhotoFile(null);
            setPhotoPreview(null);
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            setMsg(err.response?.data?.message || 'Error updating photo');
        } finally {
            setLoading(false);
        }
    };

    // Helper to get photo URL
    const getPhotoUrl = () => {
        if (user.photoUrl) {

            return user.photoUrl;
        }
        if (user.photo) {
            const BASE_URL = 'http://localhost:5000';
            if (user.photo.startsWith('http')) return user.photo;
            // Remove leading slash if any to avoid double slash with base url
            const cleanPath = user.photo.replace(/\\/g, '/').replace(/^\//, '');
            const finalUrl = `${BASE_URL}/${cleanPath}`;

            return finalUrl;
        }
        return null;
    };

    if (!user) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">My Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden mb-4 border-4 border-blue-100 shadow-sm">
                        {user.photo || user.photoUrl ? (
                            <img
                                src={getPhotoUrl() ? `${getPhotoUrl()}?t=${Date.now()}` : null}
                                alt={user.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-slate-100 text-4xl">${user.name ? user.name.charAt(0) : 'U'}</div>`;
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-slate-100 text-4xl">
                                {user.name ? user.name.charAt(0) : 'U'}
                            </div>
                        )}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-1">{user.name}</h2>
                    <p className="text-blue-600 font-medium mb-4">{user.designation || 'Staff Member'}</p>

                    <div className="w-full border-t pt-4 text-left space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Email</span>
                            <span className="font-medium text-gray-800">{user.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Phone</span>
                            <span className="font-medium text-gray-800">{user.phone || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Staff ID</span>
                            <span className="font-mono font-bold text-gray-600 bg-gray-100 px-2 rounded">{user.staffId || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Role</span>
                            <span className="font-medium text-gray-800 capitalize">{user.role}</span>
                        </div>
                    </div>
                </div>

                {/* Photo Upload Section */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col items-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 w-full text-left">Update Photo</h3>

                    <div className="w-full flex flex-col items-center space-y-4">
                        <label className="w-full cursor-pointer">
                            <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                                    <p className="text-xs text-gray-500">JPG or PNG</p>
                                </div>
                            </div>
                            <input
                                id="photo-upload"
                                name="photo"
                                type="file"
                                className="hidden"
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        // Preview
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            // You might want to set a preview state here if needed, 
                                            // but for now let's just upload directly or show a save button?
                                            // User asked for: Preview -> Save
                                            const previewUrl = reader.result;
                                            // We need state for selected file and preview
                                            setPhotoFile(file);
                                            setPhotoPreview(previewUrl);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </label>

                        {photoPreview && (
                            <div className="flex flex-col items-center space-y-4 w-full">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500">
                                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                                <button
                                    onClick={handlePhotoUpload}
                                    disabled={loading || user.isDemo}
                                    className={`w-full py-2 rounded font-semibold shadow disabled:opacity-50 
                                        ${user.isDemo ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}
                                    `}
                                >
                                    {loading ? 'Saving...' : (user.isDemo ? 'Disabled in Demo Mode' : 'Save Photo')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Change Password */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Security Settings</h3>
                    {msg && <div className={`p-3 mb-4 rounded text-sm font-medium ${msg.includes('Error') || msg.includes('match') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{msg}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input
                                id="new-password"
                                type="password"
                                name="password"
                                autoComplete="new-password"
                                value={passwordData.password}
                                onChange={handlePasswordChange}
                                required
                                className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <input
                                id="confirm-new-password"
                                type="password"
                                name="confirmPassword"
                                autoComplete="new-password"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                                className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || user.isDemo}
                            className={`w-full py-2.5 rounded font-semibold shadow transition-colors disabled:opacity-50
                                ${user.isDemo ? 'bg-gray-400 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-black'}
                            `}
                        >
                            {loading ? 'Updating...' : (user.isDemo ? 'Disabled in Demo Mode' : 'Update Password')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StaffProfile;
