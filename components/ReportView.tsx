import React, { useMemo } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { WordLog } from '../types';

interface ReportViewProps {
    logs: WordLog[];
    onClose: () => void;
}

const COLORS = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

const ReportView: React.FC<ReportViewProps> = ({ logs, onClose }) => {

    // Aggregate data by Category
    const categoryData = useMemo(() => {
        const counts: Record<string, number> = {};
        logs.forEach(log => {
            const w = log.weight;
            counts[log.category] = (counts[log.category] || 0) + w;
        });
        return Object.keys(counts).map(cat => ({
            name: cat,
            value: parseFloat(counts[cat].toFixed(2)) // Round to 2 decimals
        })).sort((a, b) => b.value - a.value);
    }, [logs]);

    // Aggregate data for detailed table
    const detailedLogs = useMemo(() => {
        return [...logs].sort((a, b) => b.timestamp - a.timestamp);
    }, [logs]);

    return (
        <div id="report-printable" className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:fixed print:inset-0 print:z-[9999]">
            <style type="text/css" media="print">
                {`
                  @page { size: auto; margin: 15mm; }
                  body { visibility: hidden; }
                  #report-printable { visibility: visible; position: absolute; left: 0; top: 0; width: 100%; height: auto !important; overflow: visible !important; display: block !important; }
                  #report-printable * { visibility: visible; }
                  /* Hide scrollbars in print */
                  ::-webkit-scrollbar { display: none; }
                `}
            </style>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden print:block print:h-auto print:max-h-none print:rounded-none print:shadow-none print:overflow-visible">

                {/* Header */}
                <div className="p-4 md:p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 print:bg-white print:border-b-2 print:p-4">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-800">Communication Summary</h2>
                        <p className="text-slate-500 text-xs md:text-sm">Word retrieval patterns and usage log</p>
                    </div>
                    <div className="flex gap-2 md:gap-3 w-full sm:w-auto print:hidden">
                        <button
                            onClick={() => window.print()}
                            className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium text-sm"
                        >
                            Print
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition font-medium text-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 print:block print:h-auto print:overflow-visible print:space-y-4 print:p-0 print:mt-4">

                    {/* Top Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 print:grid-cols-3 print:gap-4">
                        <div className="bg-blue-50 p-4 md:p-6 rounded-xl border border-blue-100 print:p-3 print:border-2 print:rounded-lg">
                            <h3 className="text-blue-600 font-semibold mb-1 text-xs md:text-sm print:text-xs print:text-black uppercase tracking-wider">Words Recovered</h3>
                            <p className="text-3xl md:text-4xl font-bold text-slate-800 print:text-xl">
                                {logs.filter(l => l.selectionMethod === 'voice_confirmed' || l.selectionMethod === 'manual_click').length}
                            </p>
                            <p className="text-[10px] md:text-sm text-slate-500 mt-1 print:text-[10px]">Confirmed by user</p>
                        </div>
                        <div className="bg-amber-50 p-4 md:p-6 rounded-xl border border-amber-100 print:p-3 print:border-2 print:rounded-lg">
                            <h3 className="text-amber-600 font-semibold mb-1 text-xs md:text-sm print:text-xs print:text-black uppercase tracking-wider">Passive Assists</h3>
                            <p className="text-3xl md:text-4xl font-bold text-slate-800 print:text-xl">
                                {logs.filter(l => l.selectionMethod === 'implicit_split').length}
                            </p>
                            <p className="text-[10px] md:text-sm text-slate-500 mt-1 print:text-[10px]">Suggestions viewed</p>
                        </div>
                        <div className="bg-emerald-50 p-4 md:p-6 rounded-xl border border-emerald-100 print:p-3 print:border-2 print:rounded-lg">
                            <h3 className="text-emerald-600 font-semibold mb-1 text-xs md:text-sm print:text-xs print:text-black uppercase tracking-wider">Engagement Rate</h3>
                            <p className="text-3xl md:text-4xl font-bold text-slate-800 print:text-xl">
                                {(() => {
                                    const activeCount = logs.filter(l => l.selectionMethod === 'voice_confirmed' || l.selectionMethod === 'manual_click').length;
                                    const passiveCount = logs.filter(l => l.selectionMethod === 'implicit_split').length;
                                    const total = activeCount + passiveCount;
                                    return total > 0 ? Math.round((activeCount / total) * 100) : 0;
                                })()}%
                            </p>
                            <p className="text-[10px] md:text-sm text-slate-500 mt-1 print:text-[10px]">Suggestions acted upon</p>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 print:block print:mt-4">
                        <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm print:border-2 print:shadow-none print:p-4 print:break-inside-avoid print:mb-6">
                            <h3 className="text-base md:text-lg font-bold text-slate-800 mb-4 md:mb-6 print:mb-2 print:text-base">Category Breakdown</h3>
                            <div className="h-48 md:h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categoryData} layout="vertical" margin={{ left: 0, right: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} interval={0} />
                                        <Tooltip cursor={{ fill: '#f1f5f9' }} />
                                        <Bar dataKey="value" fill="#2563eb" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm print:border-2 print:shadow-none print:p-4 print:break-inside-avoid print:mb-6">
                            <h3 className="text-base md:text-lg font-bold text-slate-800 mb-4 md:mb-6 print:mb-2 print:text-base">Selection Methods</h3>
                            <div className="h-48 md:h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Manual', value: logs.filter(l => l.selectionMethod === 'manual_click').length },
                                                { name: 'Voice', value: logs.filter(l => l.selectionMethod === 'voice_confirmed').length },
                                                { name: 'Passive', value: logs.filter(l => l.selectionMethod === 'implicit_split').length },
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={60}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Logs Table */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 md:p-6 border-b border-slate-200">
                            <h3 className="text-base md:text-lg font-bold text-slate-800">Session Log Details</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4">Time</th>
                                        <th className="px-6 py-4">Word</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Weight</th>
                                        <th className="px-6 py-4">Method</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {detailedLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </td>
                                            <td className="px-6 py-3 font-medium text-slate-900">{log.word}</td>
                                            <td className="px-6 py-3">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {log.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3">{log.weight.toFixed(1)}</td>
                                            <td className="px-6 py-3 capitalize">{log.selectionMethod.replace('_', ' ')}</td>
                                        </tr>
                                    ))}
                                    {detailedLogs.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                                No words logged in this session yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ReportView;
