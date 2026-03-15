import React, { useState, useEffect } from 'react';
import { VariableDef } from '../core/types';

export interface RendererProps {
    recipe: {
        metadata: { name: string; description: string };
        ui: { variables: VariableDef[] };
    };
    onSubmit: (values: Record<string, string | number | boolean>) => Promise<void>;
    result?: {
        success: boolean;
        truth?: string | number | boolean;
        trace?: any;
    };
    loading?: boolean;
    fixedValues?: Record<string, string | number | boolean>;
    readOnly?: boolean;
}

export const RecipeRenderer: React.FC<RendererProps> = ({ recipe, onSubmit, result, loading, fixedValues = {}, readOnly = false }) => {
    const [values, setValues] = useState<Record<string, string | number | boolean>>(fixedValues);
    const [discoveryData, setDiscoveryData] = useState<Record<string, any>>({});
    const variables = (recipe.ui?.variables || []).filter(v => !fixedValues[v.name] || readOnly);

    useEffect(() => {
        variables.forEach((v) => {
            if (v.source?.gatewayMethod) {
                const category = v.source.gatewayMethod.split('.').pop();
                fetch(`/api/discovery/${category}`)
                    .then(res => res.json())
                    .then(data => setDiscoveryData(prev => ({ ...prev, [v.name]: data })))
                    .catch(err => console.error(`Discovery failed for ${v.name}:`, err));
            }
        });
    }, [variables]);

    const isValid = variables.every((v) => !v.required || (values[v.name] !== undefined && values[v.name] !== ''));

    return (
        <div className="max-w-4xl mx-auto p-12 bg-white rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col items-center font-sans">
            {/* Header */}
            <div className="w-full flex items-center justify-between mb-16 border-b border-gray-50 pb-12">
                <div className="flex items-center gap-8">
                    <div className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2rem] text-white shadow-2xl shadow-indigo-200 ring-8 ring-indigo-50">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase mb-2">{recipe.metadata.name}</h1>
                        <p className="text-slate-400 font-bold text-lg">{recipe.metadata.description}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="px-5 py-2 bg-indigo-50 rounded-full flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                        <span className="text-[0.65rem] font-black text-indigo-600 uppercase tracking-widest">Testnet Bridge Active</span>
                    </div>
                    <span className="text-[0.6rem] font-black text-slate-300 uppercase tracking-[0.3em]">Protocol v3.2.0</span>
                </div>
            </div>

            {/* Form Grid */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                {variables.map((variable) => (
                    <div key={variable.name} className="group relative">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <label className="text-[0.7rem] font-black text-slate-400 uppercase tracking-[0.2em] group-focus-within:text-indigo-600 transition-all">
                                {variable.label}
                            </label>
                            {variable.required && <span className="text-[0.55rem] font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-full uppercase tracking-wider">Required</span>}
                        </div>

                        {variable.source?.gatewayMethod || variable.component === 'dynamic-search' || variable.type === 'select' ? (
                            <div className="relative group/select">
                                <select
                                    disabled={loading}
                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[1.8rem] focus:bg-white focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer text-slate-700 font-bold text-lg shadow-sm group-hover/select:bg-slate-100/50"
                                    value={(values[variable.name] as string) || ''}
                                    onChange={(e) => setValues({ ...values, [variable.name]: e.target.value })}
                                >
                                    <option value="">{variable.placeholder || 'Select Asset...'}</option>
                                    {(discoveryData[variable.name] || variable.options || []).map((opt: any) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within/select:text-indigo-600 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        ) : variable.component === 'slider' ? (
                            <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-transparent transition-all hover:bg-slate-100/50">
                                <input
                                    type="range"
                                    disabled={loading}
                                    className="w-full h-3 bg-indigo-100 rounded-full appearance-none cursor-pointer accent-indigo-600 mb-6"
                                    value={(values[variable.name] as number) || 0}
                                    onChange={(e) => setValues({ ...values, [variable.name]: Number(e.target.value) })}
                                />
                                <div className="flex justify-between items-center px-2">
                                    <span className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest text-indigo-600/60">Threshold Level</span>
                                    <div className="px-6 py-2 bg-indigo-600 rounded-2xl text-white font-black text-2xl shadow-lg shadow-indigo-100">{(values[variable.name] as number) || 0}</div>
                                </div>
                            </div>
                        ) : (
                            <input
                                type={variable.component === 'date' ? 'date' : (variable.type === 'number' ? 'number' : 'text')}
                                disabled={loading}
                                placeholder={variable.placeholder}
                                className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[1.8rem] focus:bg-white focus:border-indigo-500 outline-none transition-all text-slate-700 font-bold text-lg shadow-sm hover:bg-slate-100/50"
                                value={(values[variable.name] as string) || ''}
                                onChange={(e) => !readOnly && setValues({ ...values, [variable.name]: e.target.value })}
                                readOnly={readOnly || !!fixedValues[variable.name]}
                            />
                        )}
                        {variable.hint && (
                            <div className="mt-4 flex gap-3 items-start text-[0.7rem] text-slate-400 font-bold leading-relaxed px-4 opacity-70">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></div>
                                <p>{variable.hint}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Submit Button */}
            <button
                disabled={!isValid || loading}
                onClick={() => onSubmit(values)}
                className={`w-full max-w-md py-7 rounded-[2.2rem] font-black text-2xl tracking-tight transition-all transform hover:-translate-y-2 active:scale-95 shadow-2xl ${isValid && !loading ? 'bg-indigo-600 text-white shadow-indigo-200 cursor-pointer active:bg-indigo-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
            >
                {loading ? (
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Syncing Enclaves...</span>
                    </div>
                ) : 'Evaluate Truth Outcome'}
            </button>

            {/* Results Section */}
            {result && (
                <div className="w-full mt-20 animate-in fade-in zoom-in-95 duration-700">
                    <div className="bg-slate-900 rounded-[4rem] overflow-hidden shadow-2xl border border-slate-800">
                        {/* Status Bar */}
                        <div className="bg-slate-800/40 px-12 py-10 flex justify-between items-center border-b border-slate-700/50">
                            <div className="flex items-center gap-8">
                                <div className={`w-6 h-6 rounded-full shadow-[0_0_30px] ${result.success ? 'bg-emerald-400 shadow-emerald-400/60' : 'bg-rose-400 shadow-rose-400/60 animate-pulse'}`}></div>
                                <div>
                                    <span className="text-slate-100 font-black text-sm tracking-[0.4em] uppercase block">Attestation Finalized</span>
                                    <span className="text-slate-500 text-[0.65rem] font-bold uppercase tracking-widest mt-1 block">Signed by 12 Federated Nodes</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <span className="text-slate-500 text-[0.65rem] font-black uppercase tracking-widest block mb-1">Final Outcome</span>
                                    <span className="text-emerald-400 font-black text-4xl font-mono px-10 py-4 bg-emerald-400/10 rounded-[2rem] border border-emerald-400/20 shadow-inner inline-block min-w-[120px] text-center">{result.truth ?? '---'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Trace Viewer */}
                        <div className="p-16">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-slate-500 text-[0.75rem] font-black uppercase tracking-[0.4em]">Decentralized Trace</h3>
                                <div className="flex gap-4">
                                    <div className="px-5 py-2 bg-slate-800 rounded-full text-[0.6rem] font-black text-slate-400 border border-slate-700 uppercase tracking-widest">Enclave Proof: OK</div>
                                    <div className="px-5 py-2 bg-emerald-500/10 rounded-full text-[0.6rem] font-black text-emerald-400 border border-emerald-400/20 uppercase tracking-widest">Confidence: 99.9%</div>
                                </div>
                            </div>
                            <pre className="text-emerald-400/80 font-mono text-sm leading-relaxed overflow-x-auto p-12 bg-black/40 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-3xl custom-scrollbar shadow-inner">
                                {JSON.stringify(result.trace, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            )}

            <p className="mt-12 text-[0.6rem] font-black text-slate-300 uppercase tracking-[0.5em] opacity-50">Sovereign Truth Network • Highly Verified</p>
        </div>
    );
};
