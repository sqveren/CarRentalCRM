import { useEffect, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { ApiCar, ApiCarCategory, CarStatus, carsApi, categoriesApi, toNumber } from "../api";
import Badge from "../components/Badge";
import Modal from "../components/Modal";

type CarFormState = {
  brand: string;
  model: string;
  manufactureYear: number;
  mileage: number;
  status: CarStatus;
  categoryId: string;
};

const initialFormData = (): CarFormState => ({
  brand: "",
  model: "",
  manufactureYear: new Date().getFullYear(),
  mileage: 0,
  status: "available",
  categoryId: "",
});

export default function Cars() {
  const [cars, setCars] = useState<ApiCar[]>([]);
  const [categories, setCategories] = useState<ApiCarCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<ApiCar | null>(null);
  const [formData, setFormData] = useState<CarFormState>(initialFormData);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    try {
      setError("");
      const [carsData, categoriesData] = await Promise.all([carsApi.list(), categoriesApi.list()]);
      setCars(carsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cars.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setError("");

      const payload = {
        brand: formData.brand,
        model: formData.model,
        manufactureYear: formData.manufactureYear,
        mileage: formData.mileage,
        status: formData.status,
        categoryId: Number(formData.categoryId),
      };

      if (editingCar) {
        await carsApi.update(editingCar.id, payload);
      } else {
        await carsApi.create(payload);
      }

      await loadData();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save car.");
    }
  }

  function handleEdit(car: ApiCar) {
    setEditingCar(car);
    setFormData({
      brand: car.brand,
      model: car.model,
      manufactureYear: car.manufactureYear,
      mileage: car.mileage,
      status: car.status,
      categoryId: String(car.categoryId),
    });
    setIsModalOpen(true);
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Are you sure you want to delete this car?")) {
      return;
    }

    try {
      setError("");
      await carsApi.remove(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete car.");
    }
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingCar(null);
    setFormData(initialFormData());
  }

  const totalPages = Math.ceil(cars.length / itemsPerPage);
  const paginatedCars = cars.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Cars Management</h1>
          <p className="text-gray-600">Manage your fleet of vehicles</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Car
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mileage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price/Day</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedCars.map((car) => (
                <tr key={car.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{car.brand}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{car.model}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{car.manufactureYear}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{car.mileage.toLocaleString()} km</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{car.category?.name ?? "Unknown"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${toNumber(car.category?.pricePerDay).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge status={car.status} variant="car" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(car)} className="text-blue-600 hover:text-blue-700">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => void handleDelete(car.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, cars.length)} of {cars.length} cars
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCar ? "Edit Car" : "Add New Car"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <input
                type="number"
                value={formData.manufactureYear}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    manufactureYear: parseInt(e.target.value, 10) || new Date().getFullYear(),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mileage (km)</label>
              <input
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} (${toNumber(category.pricePerDay).toLocaleString()}/day)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as CarStatus })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="maintenance">Maintenance</option>
              <option value="cleaning">Cleaning</option>
              <option value="damaged">Damaged</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {editingCar ? "Update Car" : "Add Car"}
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
