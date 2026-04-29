import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ApiFine, ApiRental, finesApi, rentalsApi, toNumber } from "../api";
import Modal from "../components/Modal";

type FineFormState = {
  rentalId: string;
  description: string;
  amount: number;
};

const initialFormData = (): FineFormState => ({
  rentalId: "",
  description: "",
  amount: 0,
});

export default function Fines() {
  const [fines, setFines] = useState<ApiFine[]>([]);
  const [rentals, setRentals] = useState<ApiRental[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FineFormState>(initialFormData);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    try {
      setError("");
      const [finesData, rentalsData] = await Promise.all([finesApi.list(), rentalsApi.list()]);
      setFines(finesData);
      setRentals(rentalsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load fines.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setError("");
      await finesApi.create({
        rentalId: Number(formData.rentalId),
        description: formData.description,
        amount: formData.amount,
      });

      await loadData();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create fine.");
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Are you sure you want to delete this fine?")) {
      return;
    }

    try {
      setError("");
      await finesApi.remove(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete fine.");
    }
  }

  function closeModal() {
    setIsModalOpen(false);
    setFormData(initialFormData());
  }

  const totalPages = Math.ceil(fines.length / itemsPerPage);
  const paginatedFines = fines.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Fines Management</h1>
          <p className="text-gray-600">Track fines and penalties</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Fine
        </button>
      </div>

      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fine ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rental ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedFines.map((fine) => (
                <tr key={fine.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{fine.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">#{fine.rentalId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {fine.rental?.client ? `${fine.rental.client.firstName} ${fine.rental.client.lastName}` : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{fine.description ?? "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                    ${toNumber(fine.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button onClick={() => void handleDelete(fine.id)} className="text-red-600 hover:text-red-700">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, fines.length)} of {fines.length} fines
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Add New Fine">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rental</label>
            <select
              value={formData.rentalId}
              onChange={(e) => setFormData({ ...formData, rentalId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a rental</option>
              {rentals.map((rental) => (
                <option key={rental.id} value={rental.id}>
                  Rental #{rental.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              placeholder="e.g., Damage to vehicle or parking fine"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.01"
              min="0.01"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add Fine
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
