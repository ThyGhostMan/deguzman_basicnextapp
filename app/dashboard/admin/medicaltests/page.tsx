"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { showMessage } from '@/components/MessageModal';
import ConfirmModal from '@/components/ConfirmModal';
import { Search, Plus, FileSpreadsheet, FileText, Edit, Trash2, X } from "lucide-react";
import { getMedicalTests, addMedicalTest, updateMedicalTest, deleteMedicalTest, MedicalTest } from "./actions";
import { downloadMedicalTestsExcel } from "./DownloadMedicalTests";
import MedicalTestsPdfDocument from "./MedicalTestsPdfDocument";
import { pdf } from "@react-pdf/renderer";
import MedicalTestModal from "./MedicalTestModal";
import PageGuardWrapper from "@/components/PageGuardWrapper";
import ButtonGuardWrapper from "@/components/ButtonGuardWrapper";

export default function MedicalTestsPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [tests, setTests] = useState<MedicalTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [testToEdit, setTestToEdit] = useState<MedicalTest | null>(null);

    const fetchTests = useCallback(() => {
        setLoading(true);
        getMedicalTests()
            .then(setTests)
            .catch(err => {
                console.error(err);
                showMessage("Failed to load medical tests.");
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!isPending && !session) {
             router.push("/");
        }
    }, [session, isPending, router]);

    useEffect(() => {
        if (session) {
            fetchTests();
        }
    }, [session, fetchTests]);

    const handleSaveTest = async (data: any) => {
        try {
            if (data.id) {
                await updateMedicalTest(data);
                await showMessage("Medical test updated successfully!");
            } else {
                await addMedicalTest(data);
                await showMessage("Medical test added successfully!");
            }
            fetchTests();
        } catch (error) {
            console.error(error);
            await showMessage("Failed to save medical test.");
        }
    };

    const handleDeleteTest = async (test: MedicalTest) => {
        const confirmed = await ConfirmModal(`Are you sure you want to delete "${test.name}"?`, {
            okText: "Delete",
            cancelText: "Cancel",
            okColor: "bg-red-600 hover:bg-red-700"
        });

        if (confirmed) {
            try {
                await deleteMedicalTest(test.id);
                await showMessage("Medical test deleted successfully!");
                fetchTests();
            } catch (error) {
                console.error(error);
                await showMessage("Failed to delete medical test.");
            }
        }
    };

    const filteredTests = tests.filter(test => 
        test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.category_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDownloadExcel = async () => {
        const confirmed = await ConfirmModal("Download Medical Tests to Excel?", {
            okText: "Yes, Download",
            cancelText: "Cancel",
            okColor: "bg-green-600 hover:bg-green-700",
        });
        if (!confirmed) return;
        await downloadMedicalTestsExcel(filteredTests);
    };

    const handleDownloadPdf = async () => {
        const confirmed = await ConfirmModal("Download Medical Tests to PDF?", {
            okText: "Yes, Download",
            cancelText: "Cancel",
            okColor: "bg-purple-600 hover:bg-purple-700",
        });
        if (!confirmed) return;
        
        const blob = await pdf(<MedicalTestsPdfDocument tests={filteredTests} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Medical_Tests_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <PageGuardWrapper requiredRoles={["ADMINISTRATOR"]}>
            <div className="flex flex-col gap-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Medical Tests</h1>
                    
                    <div className="flex flex-1 max-w-md relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search tests..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleDownloadExcel}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md shadow-sm transition-all text-sm"
                        >
                            <FileSpreadsheet size={18} /> Download Excel
                        </button>
                        <button 
                            onClick={handleDownloadPdf}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-md shadow-sm transition-all text-sm"
                        >
                            <FileText size={18} /> Download PDF
                        </button>
                        <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR"]}>
                            <button 
                                onClick={() => { setTestToEdit(null); setIsModalOpen(true); }}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md shadow-sm transition-all text-sm"
                            >
                                <Plus size={18} /> Add Test
                            </button>
                        </ButtonGuardWrapper>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase tracking-wider border-b dark:border-gray-700">
                                    <th className="px-6 py-4">Row #</th>
                                    <th className="px-6 py-4">Test Name</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Unit</th>
                                    <th className="px-6 py-4">Min - Max</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500">Loading tests...</td>
                                    </tr>
                                ) : filteredTests.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Search size={48} className="text-gray-200 dark:text-gray-700" />
                                                <p className="text-gray-500 dark:text-gray-400 font-medium">No medical tests found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTests.map((test, index) => (
                                        <tr key={test.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-white">
                                                <div>{test.name}</div>
                                                {test.description && <div className="text-xs font-normal text-gray-500 dark:text-gray-400 line-clamp-1">{test.description}</div>}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                                    {test.category_name || "Uncategorized"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{test.uom_name || "-"}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                                                {test.normalmin !== null && test.normalmax !== null ? `${test.normalmin} - ${test.normalmax}` : (test.normalmin ?? test.normalmax ?? "-")}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <ButtonGuardWrapper requiredRoles={["ADMINISTRATOR"]}>
                                                        <button 
                                                            onClick={() => { setTestToEdit(test); setIsModalOpen(true); }}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-all"
                                                            title="Edit Test"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteTest(test)}
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-all"
                                                            title="Delete Test"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </ButtonGuardWrapper>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-t dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                        Showing {filteredTests.length} of {tests.length} tests
                    </div>
                </div>

                <MedicalTestModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveTest}
                    test={testToEdit}
                    title={testToEdit ? "Edit Medical Test" : "Add Medical Test"}
                />
            </div>
        </PageGuardWrapper>
    );
}
