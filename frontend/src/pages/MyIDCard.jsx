import { useRef, useEffect, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import api from '../api/axios';
import StaffCard from '../components/StaffCard';
import { useNavigate } from 'react-router-dom';

const MyIDCard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const componentRef = useRef();
    const navigate = useNavigate();

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/profile');
            setUser(res.data);
        } catch (err) {
            console.error(err);
            // navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Staff-ID-${user?.staffId}`,
    });

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!user) {
        return <div className="p-8 text-center text-red-500">Could not load profile.</div>;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 flex items-center gap-2">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                My ID Card
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

                {/* Preview Section */}
                <div className="flex flex-col items-center w-full">
                    <div className="bg-gray-100 p-4 sm:p-8 rounded-xl border border-gray-200 shadow-inner w-full flex justify-center min-h-[600px] overflow-y-auto">
                        <div className="w-full max-w-[360px] mx-auto">
                            <StaffCard ref={componentRef} user={user} />
                        </div>
                    </div>
                </div>

                {/* Actions / Info Section */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Card Actions</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        This is your official digital ID card. It validates your identity and access permissions within the premises.
                        Please keep a printed copy or digital version accessible at all times.
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={handlePrint}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg flex items-center justify-center gap-2 hover:translate-y-[-2px]"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Print ID Card
                        </button>

                        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg text-sm border border-yellow-200">
                            <strong>Note:</strong> Ensure you print on high-quality card stock or PVC cards for durability.
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t">
                        <h3 className="font-semibold text-gray-700 mb-2">Details on Card</h3>
                        <ul className="text-sm text-gray-500 space-y-2">
                            <li className="flex justify-between"><span>Name:</span> <span className="text-gray-900 font-medium">{user.name}</span></li>
                            <li className="flex justify-between"><span>Employee ID:</span> <span className="text-gray-900 font-medium">{user.staffId}</span></li>
                            <li className="flex justify-between"><span>Designation:</span> <span className="text-gray-900 font-medium">{user.designation}</span></li>
                            <li className="flex justify-between"><span>Role:</span> <span className="text-gray-900 font-medium capitalize">{user.role}</span></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyIDCard;
