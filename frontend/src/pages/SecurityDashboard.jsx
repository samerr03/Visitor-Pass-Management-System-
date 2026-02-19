import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import { useReactToPrint } from 'react-to-print';
import VisitorPass from '../components/VisitorPass';
import ConfirmModal from '../components/ConfirmModal';
import VisitorPassPrintable from '../components/VisitorPassPrintable';
import PhotoCaptureModal from '../components/PhotoCaptureModal';
import {
    Camera,
    User,
    Phone,
    FileText,
    Users,
    LogOut,
    Search,
    CheckCircle,
    AlertCircle,
    CreditCard,
    Loader2
} from 'lucide-react';

const SecurityDashboard = () => {
    const [visitors, setVisitors] = useState([]);
    const [activeVisitors, setActiveVisitors] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        purpose: '',
        idProofType: 'Aadhar', // Default
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
            if (Array.isArray(res.data)) {
                setActiveVisitors(res.data);
            } else {
                setActiveVisitors([]);
                console.error("API did not return an array", res.data);
            }
        } catch (err) {
            console.error(err);
            setActiveVisitors([]);
        }
    };

    // Search active visitors
    const searchActiveVisitors = async (keyword) => {
        try {
            const res = await api.get(`/visitors?status=active&keyword=${keyword}`);
            if (Array.isArray(res.data)) {
                setActiveVisitors(res.data);
            } else {
                setActiveVisitors([]);
            }
        } catch (err) {
            console.error(err);
            setActiveVisitors([]);
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
        const { name, value } = e.target;

        if (name === 'phone') {
            // Only allow numbers and max 10 digits
            if (/^\d{0,10}$/.test(value)) {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        } else if (name === 'idProofNumber') {
            if (formData.idProofType === 'Aadhar') {
                // Aadhar: Numbers only, max 12
                if (/^\d{0,12}$/.test(value)) {
                    setFormData(prev => ({ ...prev, [name]: value }));
                }
            } else {
                // DL: Alphanumeric + spaces, max 16
                if (/^[a-zA-Z0-9 ]{0,16}$/.test(value)) {
                    setFormData(prev => ({ ...prev, [name]: value.toUpperCase() })); // Auto-uppercase for DL
                }
            }
        } else if (name === 'idProofType') {
            // Reset number when type changes to prevent invalid states
            setFormData(prev => ({ ...prev, [name]: value, idProofNumber: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
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

        if (formData.phone.length !== 10) {
            setMsg('Error: Phone number must be exactly 10 digits.');
            return;
        }

        if (formData.idProofType === 'Aadhar' && formData.idProofNumber.length !== 12) {
            setMsg('Error: Aadhar number must be exactly 12 digits.');
            return;
        }

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
                idProofType: 'Aadhar',
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
            console.error(err);
            if (err.response?.data?.errors) {
                // Handle validation errors array
                setMsg(`Error: ${err.response.data.errors.map(e => e.msg).join(', ')}`);
            } else {
                setMsg(err.response?.data?.message || 'Error creating pass');
            }
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
            console.error(err);
            alert(err.response?.data?.message || 'Error checking out');
        } finally {
            setCheckoutLoading(false);
            setSelectedVisitor(null);
        }
    };

    const isFormValid = formData.name && formData.phone.length === 10 && formData.purpose && formData.personToMeet && formData.idProofNumber && formData.photo;

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security Console</h1>
                        <p className="text-slate-500 text-sm mt-1">Manage visitor entries and exits</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-sm font-medium text-slate-700">System Online</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    {/* Left Col: Entry Form */}
                    <div className="xl:col-span-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-6">
                            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <User className="w-5 h-5 text-indigo-600" />
                                    New Visitor Entry
                                </h2>
                            </div>

                            <div className="p-6">
                                {msg && (
                                    <div className={`p-3 mb-6 rounded-lg text-sm font-medium flex items-center gap-2 ${msg.includes('Error') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                        }`}>
                                        {msg.includes('Error') ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                        {msg}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Photo Capture Area */}
                                    <div className="flex flex-col items-center justify-center mb-2">
                                        <div
                                            onClick={() => setShowWebcamModal(true)}
                                            className={`relative w-32 h-32 rounded-full cursor-pointer transition-all duration-300 group ${preview
                                                ? 'ring-4 ring-emerald-500/20'
                                                : formData.phone && !formData.photo // "Missing photo" state (touched logic simplified)
                                                    ? 'bg-red-50 border-2 border-dashed border-red-300 hover:bg-red-100'
                                                    : 'bg-slate-50 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50'
                                                }`}
                                        >
                                            <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center relative">
                                                {preview ? (
                                                    <>
                                                        <img src={preview} alt="Visitor" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Camera className="w-8 h-8 text-white mb-1" />
                                                            <span className="text-xs text-white font-medium">Retake</span>
                                                        </div>
                                                        <div className="absolute bottom-1 right-1 bg-emerald-500 text-white p-1 rounded-full shadow-md border-2 border-white">
                                                            <CheckCircle className="w-3 h-3" />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                                                        <Camera className={`w-8 h-8 mb-1 ${formData.phone && !formData.photo ? 'text-red-400' : ''}`} />
                                                        <span className={`text-[10px] font-semibold uppercase tracking-wide ${formData.phone && !formData.photo ? 'text-red-500' : ''}`}>
                                                            {formData.phone && !formData.photo ? 'Required' : 'Photo'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-400 mt-2 font-medium">Click to capture visitor photo</span>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label htmlFor="visitor-name" className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    id="visitor-name"
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Enter visitor name"
                                                    autoComplete="name"
                                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label htmlFor="visitor-phone" className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    id="visitor-phone"
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="10-digit mobile number"
                                                    maxLength={10}
                                                    autoComplete="tel"
                                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-mono"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label htmlFor="visitor-id-type" className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">ID Type</label>
                                                <div className="relative">
                                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <select
                                                        id="visitor-id-type"
                                                        name="idProofType"
                                                        value={formData.idProofType}
                                                        onChange={handleChange}
                                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer text-slate-700"
                                                    >
                                                        <option value="Aadhar">Aadhar</option>
                                                        <option value="Driving License">License</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label htmlFor="visitor-id-number" className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">ID Number</label>
                                                <input
                                                    id="visitor-id-number"
                                                    type="text"
                                                    name="idProofNumber"
                                                    value={formData.idProofNumber}
                                                    onChange={handleChange}
                                                    placeholder="XXXX XXXX XXXX"
                                                    maxLength={formData.idProofType === 'Aadhar' ? 12 : 16}
                                                    autoComplete="off"
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-mono"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label htmlFor="visitor-meet" className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Meeting With</label>
                                            <div className="relative">
                                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    id="visitor-meet"
                                                    type="text"
                                                    name="personToMeet"
                                                    value={formData.personToMeet}
                                                    onChange={handleChange}
                                                    placeholder="Employee name"
                                                    autoComplete="off"
                                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label htmlFor="visitor-purpose" className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Purpose</label>
                                            <div className="relative">
                                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    id="visitor-purpose"
                                                    type="text"
                                                    name="purpose"
                                                    value={formData.purpose}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Interview, Delivery"
                                                    autoComplete="off"
                                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 mt-2
                                            ${loading
                                                ? 'bg-indigo-400 cursor-not-allowed'
                                                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 active:scale-[0.98] text-white'
                                            }
                                        `}
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="w-5 h-5" />}
                                        {loading ? 'Processing...' : 'Generate Pass & Check-In'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Active Visitors Table */}
                    <div className="xl:col-span-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-[600px]">
                            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-xs">{activeVisitors.length}</span>
                                    Active Visitors
                                </h2>
                                <div className="relative w-full sm:w-72">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        id="search-active-visitors"
                                        name="search"
                                        type="text"
                                        placeholder="Search active visitors..."
                                        aria-label="Search active visitors"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-sm transition-all"
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto flex-1">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            <th className="px-6 py-4">Visitor</th>
                                            <th className="px-6 py-4">Pass ID</th>
                                            <th className="px-6 py-4">Meeting</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {activeVisitors.length > 0 ? (
                                            activeVisitors.map((visitor) => (
                                                <tr key={visitor._id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                                                {visitor.photo ? (
                                                                    <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${visitor.photo}`} alt={visitor.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <User className="w-5 h-5 text-slate-400" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{visitor.name}</p>
                                                                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                                                    <Phone className="w-3 h-3" />
                                                                    {visitor.phone}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-mono text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                                            {visitor.passId}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-slate-700 font-medium">{visitor.personToMeet}</div>
                                                        <div className="text-xs text-slate-500 mt-0.5">{visitor.purpose}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                                                            <span className="relative flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                            </span>
                                                            Inside
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 mt-1 pl-1">
                                                            In: {new Date(visitor.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => initiateCheckout(visitor)}
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-end gap-1 ml-auto"
                                                        >
                                                            <LogOut className="w-4 h-4" />
                                                            Check Out
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5">
                                                    <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                                            <Users className="w-8 h-8 opacity-20" />
                                                        </div>
                                                        <p className="text-sm font-medium">Visitors will appear here once checked-in.
                                                        </p>
                                                    </div>
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
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in no-print">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full flex flex-col max-h-[90vh] overflow-hidden transform transition-all scale-100 ring-1 ring-slate-900/5">
                            {/* Modal Header */}
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
                                <div className="flex items-center gap-2 text-emerald-600">
                                    <CheckCircle className="w-5 h-5 fill-emerald-100" />
                                    <h3 className="text-lg font-bold text-slate-800">Pass Generated</h3>
                                </div>
                                <button onClick={() => setShowPassModal(false)} className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            {/* Modal Body - Scrollable if needed */}
                            <div className="p-6 bg-slate-100 overflow-y-auto flex-1 flex items-center justify-center">
                                {/* Display Component (Not for printing) */}
                                <VisitorPass innerRef={componentRef} visitor={currentPass} />
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 bg-white border-t border-slate-100 flex gap-3 shrink-0">
                                <button
                                    onClick={handlePrint}
                                    className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl hover:bg-slate-800 font-semibold shadow-lg shadow-slate-200 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                    Print Pass
                                </button>
                                <button
                                    onClick={() => setShowPassModal(false)}
                                    className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-xl hover:bg-slate-50 font-medium transition-colors"
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
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col gap-2 text-sm mt-2">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                <span className="text-slate-500 font-medium">Visitor Name</span>
                                <span className="text-slate-900 font-bold text-base">{selectedVisitor.name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Pass ID</span>
                                <span className="font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">{selectedVisitor.passId}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Check-in Time</span>
                                <span className="text-slate-700 font-medium">
                                    {new Date(selectedVisitor.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    )}
                </ConfirmModal>
            </div>
        </div>
    );
};

export default SecurityDashboard;
