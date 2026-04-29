import { useEffect, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { ApiService, servicesApi, toNumber } from "../api";
import Modal from "../components/Modal";

type ServiceFormState = {
  name: string;
  price: number;
};

const initialFormData = (): ServiceFormState => ({
  name: "",
  price: 0,
});

export default function Services() {
  const [services, setServices] = useState<ApiService[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ApiService | null>(null);
  const [formData, setFormData] = useState<ServiceFormState>(initialFormData);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadServices();
  }, []);

  async function loadServices() {
    try {
      setError("");
      setServices(await servicesApi.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load services.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setError("");

      if (editingService) {
        await servicesApi.update(editingService.id, formData);
      } else {
        await servicesApi.create(formData);
      }

      await loadServices();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save service.");
    }
  }

  function handleEdit(service: ApiService) {
    setEditingService(service);
    setFormData({
      name: service.name,
      price: toNumber(service.price),
    });
    setIsModalOpen(true);
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Are you sure you want to delete this service?")) {
      return;
    }

    try {
      setError("");
      await servicesApi.remove(id);
      await loadServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete service.");
    }
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData(initialFormData());
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Services Management</h1>
          <p className="text-gray-600">Manage additional services for rentals</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Service
        </button>
      </div>

      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{service.name}</h3>
                <p className="text-2xl font-bold text-blue-600">${toNumber(service.price).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => void handleDelete(service.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm">Available as an additional paid option for rentals.</p>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingService ? "Edit Service" : "Add New Service"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., GPS Navigation"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {editingService ? "Update Service" : "Add Service"}
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
