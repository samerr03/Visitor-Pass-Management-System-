import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import { useReactToPrint } from 'react-to-print';
import VisitorPass from '../components/VisitorPass';
import ConfirmModal from '../components/ConfirmModal';
import VisitorPassPrintable from '../components/VisitorPassPrintable';
import PhotoCaptureModal from '../components/PhotoCaptureModal';

const SecurityDashboard = () => {
    const [visitors, setVisitors] = useState([]);
    const [activeVisitors, setActiveVisitors] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        purpose: '',
        idProofNumber: '',
        personToMeet: '',
        photo: null // Add photo state
    });
    const [preview, setPreview] = useState(null); // Image preview url
    const [msg, setMsg] = useState('');
    const [showPassModal, setShowPassModal] = useState(false);
    const [currentPass, setCurrentPass] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Webcam Modal State
    const [showWebcamModal, setShowWebcamModal] = useState(false);

    // Confirmation Modal State
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedVisitor, setSelectedVisitor] = useState(null);
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    const printRef = useRef();
    const componentRef = useRef();

    const handlePrint = useReactToPrint({
        contentRef: printRef, // New syntax
        documentTitle: `VisitorPass-${currentPass?.passId}`,
        onAfterPrint: () => console.log("Print Success"),
    });

    const fetchActiveVisitors = async () => {
        try {
            const res = await api.get('/visitors?status=active');
            setActiveVisitors(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    // Search active visitors
    const searchActiveVisitors = async (keyword) => {
        try {
            const res = await api.get(`/visitors?status=active&keyword=${keyword}`);
            setActiveVisitors(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchActiveVisitors();

        const interval = setInterval(() => {
            if (!searchTerm) fetchActiveVisitors();
        }, 30000);

        return () => clearInterval(interval);
    }, [searchTerm]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm) {
                searchActiveVisitors(searchTerm);
            } else {
                fetchActiveVisitors();
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Helper: Convert DataURI to File
    const dataURLtoFile = (dataurl, filename) => {
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    const handlePhotoCapture = (imageSrc) => {
        const file = dataURLtoFile(imageSrc, 'visitor-photo.jpg');
        setFormData({ ...formData, photo: file });
        setPreview(imageSrc);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.photo) {
            setMsg('Error: Visitor photo is required.');
            return;
        }

        setLoading(true);
        setMsg('');

        const data = new FormData();
        data.append('name', formData.name);
        data.append('phone', formData.phone);
        data.append('purpose', formData.purpose);
        data.append('idProofNumber', formData.idProofNumber);
        data.append('personToMeet', formData.personToMeet);
        if (formData.photo) {
            data.append('photo', formData.photo);
        }

        try {
            const res = await api.post('/visitors', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMsg('Pass Generated Successfully');
            setFormData({
                name: '',
                phone: '',
                purpose: '',
                idProofNumber: '',
                personToMeet: '',
                photo: null
            });
            setPreview(null);
            setCurrentPass(res.data);
            setShowPassModal(true);
            fetchActiveVisitors();
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            setMsg(err.response?.data?.message || 'Error creating pass');
        } finally {
            setLoading(false);
        }
    };

    const initiateCheckout = (visitor) => {
        setSelectedVisitor(visitor);
        setShowConfirmModal(true);
    };

    const processCheckout = async (id) => {
        setCheckoutLoading(true);
        try {
            await api.put(`/visitors/${id}/checkout`);
            fetchActiveVisitors();
            setShowConfirmModal(false);
        } catch (err) {
            alert('Error checking out');
        } finally {
            setCheckoutLoading(false);
            setSelectedVisitor(null);
        }
    };

    return (
        <>
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Security Dashboard</h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Create Pass Form */}
                    <div className="lg:col-span-4 h-fit">
                        <div className="bg-white p-6 rounded-lg shadow-md sticky top-6">
                            <h2 className="text-xl font-bold mb-4 text-blue-700 border-b pb-2">New Visitor Entry</h2>
                            {msg && <div className={`p-3 mb-4 rounded text-sm font-medium ${msg.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{msg}</div>}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Photo Capture Trigger */}
                                <div className="flex flex-col items-center mb-4">
                                    <div
                                        onClick={() => setShowWebcamModal(true)}
                                        className="relative w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors cursor-pointer group shadow-sm hover:shadow-md"
                                        title="Click to capture photo"
                                    >
                                        {preview ? (
                                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center p-2 text-gray-400 group-hover:text-blue-500 flex flex-col items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="text-xs font-semibold">Capture Photo*</span>
                                            </div>
                                        )}
                                        {/* Camera Icon Overlay on Hover/Existing */}
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </div>
                                    </div>
                                    {!formData.photo && <span className="text-xs text-red-500 mt-1">* Photo required</span>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Visitor Name*</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="John Doe" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone*</label>
                                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" placeholder="98765..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ID Proof No.*</label>
                                        <input type="text" name="idProofNumber" value={formData.idProofNumber} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" placeholder="Aadhar/DL" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Person to Meet*</label>
                                    <input type="text" name="personToMeet" value={formData.personToMeet} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" placeholder="Employee Name" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Purpose*</label>
                                    <input type="text" name="purpose" value={formData.purpose} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" placeholder="Meeting/Interview" />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !formData.photo}
                                    className="w-full bg-blue-600 text-white py-2.5 rounded hover:bg-blue-700 font-semibold shadow transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading && (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    )}
                                    {loading ? 'Generating...' : 'Generate Pass & Check-in'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Active Visitors List */}
                    <div className="lg:col-span-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                                <h2 className="text-xl font-bold text-gray-800">Active Visitors ({activeVisitors.length})</h2>
                                <div className="w-full sm:w-64">
                                    <input
                                        type="text"
                                        placeholder="Search by name, phone or ID..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b-2 border-gray-100">
                                            <th className="p-3 text-sm font-semibold text-gray-600">Pass ID</th>
                                            <th className="p-3 text-sm font-semibold text-gray-600">Visitor</th>
                                            <th className="p-3 text-sm font-semibold text-gray-600">Meeting</th>
                                            <th className="p-3 text-sm font-semibold text-gray-600">Check-In</th>
                                            <th className="p-3 text-sm font-semibold text-gray-600 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {activeVisitors.map((visitor) => (
                                            <tr key={visitor._id} className="hover:bg-blue-50 transition-colors">
                                                <td className="p-3 font-mono text-sm text-blue-600">{visitor.passId}</td>
                                                <td className="p-3">
                                                    <div className="font-medium text-gray-900">{visitor.name}</div>
                                                    <div className="text-xs text-gray-500">{visitor.phone}</div>
                                                </td>
                                                <td className="p-3 text-sm text-gray-700">{visitor.personToMeet}</td>
                                                <td className="p-3 text-sm text-gray-500">
                                                    {new Date(visitor.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <button
                                                        onClick={() => initiateCheckout(visitor)}
                                                        className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded text-sm font-medium transition-colors"
                                                    >
                                                        Check Out
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {activeVisitors.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="p-8 text-center text-gray-400">
                                                    No active visitors found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hidden Printable Component using off-screen positioning */}
                <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
                    <VisitorPassPrintable ref={printRef} visitor={currentPass} />
                </div>

                {/* Webcam Capture Modal */}
                <PhotoCaptureModal
                    isOpen={showWebcamModal}
                    onClose={() => setShowWebcamModal(false)}
                    onCapture={handlePhotoCapture}
                />

                {/* Pass Generation Modal */}
                {showPassModal && currentPass && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in no-print">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full flex flex-col max-h-[90vh] overflow-hidden transform transition-all scale-100">
                            {/* Modal Header */}
                            <div className="p-4 bg-slate-50 border-b flex justify-between items-center shrink-0">
                                <h3 className="text-lg font-bold text-slate-800">Pass Generated Successfully</h3>
                                <button onClick={() => setShowPassModal(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            {/* Modal Body - Scrollable if needed */}
                            <div className="p-6 bg-slate-200 overflow-y-auto flex-1 flex items-center justify-center">
                                {/* Display Component (Not for printing) */}
                                <VisitorPass innerRef={componentRef} visitor={currentPass} />
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 bg-white border-t flex gap-3 shrink-0">
                                <button
                                    onClick={handlePrint}
                                    className="flex-1 bg-slate-900 text-white py-2.5 rounded-lg hover:bg-black font-semibold shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                    Print Pass
                                </button>
                                <button
                                    onClick={() => setShowPassModal(false)}
                                    className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Custom Confirm Modal */}
                <ConfirmModal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={() => processCheckout(selectedVisitor?._id)}
                    title="Confirm Check-out"
                    message="Mark this visitor as checked out? This will set the exit time and move them to the completed visits list."
                    confirmText="Yes, Check Out"
                    confirmColor="bg-red-600 hover:bg-red-700"
                    loading={checkoutLoading}
                >
                    {selectedVisitor && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex flex-col gap-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-medium">Visitor Name:</span>
                                <span className="text-gray-900 font-bold">{selectedVisitor.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-medium">Pass ID:</span>
                                <span className="text-blue-600 font-mono font-bold">{selectedVisitor.passId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-medium">Check-in Time:</span>
                                <span className="text-gray-700">
                                    {new Date(selectedVisitor.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    )}
                </ConfirmModal>
            </div>
        </>
    );
};

export default SecurityDashboard;
