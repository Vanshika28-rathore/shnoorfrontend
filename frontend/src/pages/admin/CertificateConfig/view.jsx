import React from 'react';
import { FaCertificate, FaSignature, FaSave, FaImage } from 'react-icons/fa';

const CertificateConfigView = ({ loading, uploadingField, config, updateField, handleSave, handleFileUpload }) => {

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">Loading settings...</p>
            </div>
        </div>
    );

    return (
        <div className="p-8 w-full">
            <div className="text-center mb-10">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-amber-50 shadow-sm">
                    <FaCertificate size={28} />
                </div>
                <h2 className="text-2xl font-bold text-primary-900">Certificate Configuration</h2>
                <p className="text-slate-500 mt-2">Customize the certificates issued to students.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <form onSubmit={handleSave} className="p-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Issuer Name</label>
                            <input
                                value={config.issuerName}
                                onChange={e => updateField('issuerName', e.target.value)}
                                placeholder="e.g. SHNOOR Academy"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                            />
                        </div>



                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Certificate Title</label>
                            <input
                                value={config.title}
                                onChange={e => updateField('title', e.target.value)}
                                placeholder="Certificate of Achievement"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <FaImage /> School/Company Logo
                            </label>
                            <input
                                value={config.logoUrl}
                                onChange={e => updateField('logoUrl', e.target.value)}
                                placeholder="https://example.com/logo.png"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium mb-2"
                            />
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    disabled={uploadingField === 'logoUrl'}
                                    onChange={(e) => handleFileUpload(e.target.files[0], 'logoUrl')}
                                    className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                                />
                                {uploadingField === 'logoUrl' && <span className="text-sm text-blue-600 font-medium animate-pulse">Uploading...</span>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Issued By / Authority Name</label>
                            <input
                                value={config.authorityName}
                                onChange={e => updateField('authorityName', e.target.value)}
                                placeholder="e.g. Director of Education"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <FaImage /> Background Template URL
                            </label>
                            <input
                                value={config.templateUrl}
                                onChange={e => updateField('templateUrl', e.target.value)}
                                placeholder="https://example.com/cert-bg.png"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium mb-2"
                            />
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    disabled={uploadingField === 'templateUrl'}
                                    onChange={(e) => handleFileUpload(e.target.files[0], 'templateUrl')}
                                    className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                                />
                                {uploadingField === 'templateUrl' && <span className="text-sm text-blue-600 font-medium animate-pulse">Uploading...</span>}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Provide a direct link or upload an image.</p>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <FaSignature /> Signature Image URL
                            </label>
                            <input
                                value={config.signatureUrl}
                                onChange={e => updateField('signatureUrl', e.target.value)}
                                placeholder="https://example.com/signature.png"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium mb-2"
                            />
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    disabled={uploadingField === 'signatureUrl'}
                                    onChange={(e) => handleFileUpload(e.target.files[0], 'signatureUrl')}
                                    className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                                />
                                {uploadingField === 'signatureUrl' && <span className="text-sm text-blue-600 font-medium animate-pulse">Uploading...</span>}
                            </div>
                        </div>

                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 text-center relative overflow-hidden">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Preview</h4>

                        <div className="w-full max-w-md mx-auto aspect-[1.4] bg-white border-4 border-blue-900 relative shadow-lg">
                            {config.templateUrl && (
                                <img src={config.templateUrl} alt="Bg" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                            )}
                            <div className="relative z-10 p-6 h-full flex flex-col items-center justify-center font-serif text-slate-800">
                                <h3 className="text-xl italic mt-8 mb-2">Certificate of Completion</h3>
                                <p className="text-sm">Awarded to <strong>Student Name</strong></p>

                                <div className="mt-auto ml-auto w-32 flex flex-col items-center">
                                    {config.signatureUrl ? (
                                        <img src={config.signatureUrl} alt="Sign" className="h-8 object-contain mb-1" />
                                    ) : (
                                        <div className="font-cursive text-lg mb-1" style={{ fontFamily: 'cursive' }}>Signature</div>
                                    )}
                                    <div className="w-full border-t border-slate-900 mb-1"></div>
                                    <small className="text-[10px] uppercase font-bold text-slate-500">{config.authorityName}</small>
                                </div>
                            </div>
                            { }
                            <div className="absolute top-0 left-0 border-t-[40px] border-r-[40px] border-t-blue-900 border-r-transparent"></div>
                            <div className="absolute bottom-0 right-0 border-b-[40px] border-l-[40px] border-b-blue-900 border-l-transparent"></div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={!!uploadingField}
                            className={`flex items-center gap-2 px-8 py-3 bg-primary-900 text-white rounded-xl font-bold shadow-lg shadow-primary-900/30 transition-all ${uploadingField ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800 hover:-translate-y-0.5'}`}
                        >
                            <FaSave /> {uploadingField ? "Wait for Upload..." : "Save Configuration"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CertificateConfigView;
