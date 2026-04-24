"use client";

import { useState, useRef, useEffect } from "react";
import { X, GripHorizontal } from "lucide-react";
import { MedicalTest, UOM, TestCategory, getUOMs, getTestCategories } from "./actions";

interface MedicalTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  test?: MedicalTest | null;
  title: string;
}

export default function MedicalTestModal({ isOpen, onClose, onSave, test, title }: MedicalTestModalProps) {
  const [testName, setTestName] = useState("");
  const [description, setDescription] = useState("");
  const [idUom, setIdUom] = useState("");
  const [idCategory, setIdCategory] = useState("");
  const [normalMin, setNormalMin] = useState<string>("");
  const [normalMax, setNormalMax] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [uoms, setUoms] = useState<UOM[]>([]);
  const [categories, setCategories] = useState<TestCategory[]>([]);

  // Draggable state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const currentTranslate = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      // Fetch dropdown data
      getUOMs().then(setUoms);
      getTestCategories().then(setCategories);

      setTestName(test?.name || "");
      setDescription(test?.description || "");
      setIdUom(test?.iduom || "");
      setIdCategory(test?.idcategory || "");
      setNormalMin(test?.normalmin?.toString() || "");
      setNormalMax(test?.normalmax?.toString() || "");
      setPosition({ x: 0, y: 0 });
      currentTranslate.current = { x: 0, y: 0 };
    }
  }, [isOpen, test]);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPosition({ x: currentTranslate.current.x + dx, y: currentTranslate.current.y + dy });
  };

  const onMouseUp = (e: MouseEvent) => {
    if (isDragging.current) {
        currentTranslate.current = {
            x: currentTranslate.current.x + (e.clientX - dragStart.current.x),
            y: currentTranslate.current.y + (e.clientY - dragStart.current.y)
        };
        isDragging.current = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim() || !idUom || !idCategory) return;

    setIsSubmitting(true);
    try {
      const data = {
        name: testName,
        description,
        iduom: idUom,
        idcategory: idCategory,
        normalmin: normalMin === "" ? null : parseFloat(normalMin),
        normalmax: normalMax === "" ? null : parseFloat(normalMax),
        ...(test?.id ? { id: test.id } : {})
      };
      await onSave(data);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        ref={modalRef}
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col"
      >
        <div 
          onMouseDown={onMouseDown}
          className="bg-blue-600 p-4 flex justify-between items-center cursor-move text-white"
        >
          <div className="flex items-center gap-2">
            <GripHorizontal size={20} className="opacity-50" />
            <h3 className="text-xl font-bold">{title}</h3>
          </div>
          <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Test Name</label>
            <input
              type="text"
              required
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Hemoglobin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Test description..."
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select
              required
              value={idCategory}
              onChange={(e) => setIdCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit of Measure</label>
            <select
              required
              value={idUom}
              onChange={(e) => setIdUom(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Unit</option>
              {uoms.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Normal Min</label>
              <input
                type="number"
                step="any"
                value={normalMin}
                onChange={(e) => setNormalMin(e.target.value)}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0.0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Normal Max</label>
              <input
                type="number"
                step="any"
                value={normalMax}
                onChange={(e) => setNormalMax(e.target.value)}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="10.0"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Test"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
