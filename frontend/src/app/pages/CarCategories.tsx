import { useEffect, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { ApiCarCategory, categoriesApi, toNumber } from "../api";
import Modal from "../components/Modal";

type CategoryFormState = {
  name: string;
  pricePerDay: number;
};

const initialFormData = (): CategoryFormState => ({
  name: "",
  pricePerDay: 0,
});

export default function CarCategories() {
  const [categories, setCategories] = useState<ApiCarCategory[]>([]);
  const [editingCategory, setEditingCategory] = useState<ApiCarCategory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CategoryFormState>(initialFormData);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setError("");
      setCategories(await categoriesApi.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load car categories.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setError("");

      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, formData);
      } else {
        await categoriesApi.create(formData);
      }

      await loadCategories();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category.");
    }
  }

  function handleEdit(category: ApiCarCategory) {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      pricePerDay: toNumber(category.pricePerDay),
    });
    setIsModalOpen(true);
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      setError("");
      await categoriesApi.remove(id);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category.");
    }
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData(initialFormData());
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Car Categories</h1>
          <p className="text-gray-600">Manage fleet categories and base daily prices</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price/Day</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${toNumber(category.pricePerDay).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(category)} className="text-blue-600 hover:text-blue-700">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => void handleDelete(category.id)} className="text-red-600 hover:text-red-700">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCategory ? "Edit Category" : "Add Category"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price per Day ($)</label>
            <input
              type="number"
              value={formData.pricePerDay}
              onChange={(e) => setFormData({ ...formData, pricePerDay: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.01"
              min="0.01"
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              {editingCategory ? "Update Category" : "Add Category"}
            </button>
            <button type="button" onClick={closeModal} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
