import ExcelJS from 'exceljs';
import { MedicalTest } from "./actions";

export const downloadMedicalTestsExcel = async (tests: MedicalTest[]) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Medical Tests");

    worksheet.columns = [
        { header: "Row #", key: "rowNumber", width: 8 },
        { header: "Test Name", key: "name", width: 25 },
        { header: "Category", key: "category", width: 20 },
        { header: "Unit", key: "unit", width: 12 },
        { header: "Min Value", key: "normalmin", width: 12 },
        { header: "Max Value", key: "normalmax", width: 12 },
        { header: "Description", key: "description", width: 30 }
    ];

    tests.forEach((test, index) => {
        worksheet.addRow({
            rowNumber: index + 1,
            name: test.name,
            category: test.category_name || "Uncategorized",
            unit: test.uom_name || "-",
            normalmin: test.normalmin ?? "-",
            normalmax: test.normalmax ?? "-",
            description: test.description || ""
        });
    });

    // Formatting
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Medical_Tests_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};
