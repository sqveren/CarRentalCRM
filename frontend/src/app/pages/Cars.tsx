import { useEffect, useState } from "react";
import { Edit, Gauge, Plus, Tag, Trash2 } from "lucide-react";
import { ApiCar, ApiCarCategory, CarStatus, carsApi, categoriesApi, getAuthSession, toNumber } from "../api";
import Badge from "../components/Badge";
import Modal from "../components/Modal";

type CarFormState = {
  brand: string;
  model: string;
  manufactureYear: number;
  mileage: number;
  status: CarStatus;
  imageUrl: string;
  categoryId: string;
};

const initialFormData = (): CarFormState => ({
  brand: "",
  model: "",
  manufactureYear: new Date().getFullYear(),
  mileage: 0,
  status: "available",
  imageUrl: "",
  categoryId: "",
});

export default function Cars() {
  const isAdmin = getAuthSession()?.employee.role === "admin";
  const [cars, setCars] = useState<ApiCar[]>([]);
  const [categories, setCategories] = useState<ApiCarCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<ApiCar | null>(null);
  const [selectedCar, setSelectedCar] = useState<ApiCar | null>(null);
  const [formData, setFormData] = useState<CarFormState>(initialFormData);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    try {
      setError("");
      const [carsData, categoriesData] = await Promise.all([
        carsApi.list(),
        isAdmin ? categoriesApi.list() : Promise.resolve([]),
      ]);
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
        imageUrl: formData.imageUrl || null,
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
      imageUrl: car.imageUrl ?? "",
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

  function renderCarVisual(car: ApiCar, className = "h-full w-full") {
    if (car.imageUrl) {
      return (
        <img
          src={car.imageUrl}
          alt={`${car.brand} ${car.model}`}
          className={`${className} object-cover`}
        />
      );
    }

    return (
      <div className={`${className} flex flex-col justify-center bg-[radial-gradient(circle_at_20%_20%,#dbeafe,transparent_32%),linear-gradient(135deg,#0f172a,#2563eb)] p-8 text-white`}>
        <p className="text-sm font-medium uppercase tracking-[0.35em] text-white/60">{car.category?.name ?? "Fleet"}</p>
        <p className="mt-4 text-4xl font-black">{car.brand}</p>
        <p className="text-2xl font-semibold text-white/80">{car.model}</p>
      </div>
    );
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
        {isAdmin ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Add Car
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {paginatedCars.map((car) => (
          <button
            key={car.id}
            type="button"
            onClick={() => setSelectedCar(car)}
            className="group overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative h-56 overflow-hidden bg-gray-100">
              <div className="h-full w-full transition duration-500 group-hover:scale-105">
                {renderCarVisual(car)}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute left-4 top-4">
                <Badge status={car.status} variant="car" />
              </div>
              {isAdmin ? (
                <div className="absolute right-4 top-4 flex gap-2">
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleEdit(car);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.stopPropagation();
                        handleEdit(car);
                      }
                    }}
                    className="rounded-full bg-white/90 p-2 text-blue-600 shadow hover:bg-white"
                  >
                    <Edit size={18} />
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleDelete(car.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.stopPropagation();
                        void handleDelete(car.id);
                      }
                    }}
                    className="rounded-full bg-white/90 p-2 text-red-600 shadow hover:bg-white"
                  >
                    <Trash2 size={18} />
                  </span>
                </div>
              ) : null}
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-sm font-medium uppercase tracking-wide text-white/75">
                  {car.category?.name ?? "Unknown category"}
                </p>
                <h2 className="text-2xl font-bold text-white">
                  {car.brand} {car.model}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 p-5 text-sm">
              <div>
                <p className="text-gray-500">Year</p>
                <p className="font-semibold text-gray-900">{car.manufactureYear}</p>
              </div>
              <div>
                <p className="text-gray-500">Mileage</p>
                <p className="font-semibold text-gray-900">{car.mileage.toLocaleString()} km</p>
              </div>
              <div>
                <p className="text-gray-500">Per day</p>
                <p className="font-semibold text-gray-900">${toNumber(car.category?.pricePerDay).toLocaleString()}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-6 py-4">
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

      <Modal
        isOpen={Boolean(selectedCar)}
        onClose={() => setSelectedCar(null)}
        title={selectedCar ? `${selectedCar.brand} ${selectedCar.model}` : "Car Details"}
      >
        {selectedCar ? (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-xl bg-gray-100">
              {renderCarVisual(selectedCar, "h-72 w-full")}
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Vehicle #{selectedCar.id}</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedCar.brand} {selectedCar.model}
                </h3>
              </div>
              <Badge status={selectedCar.status} variant="car" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Manufacture Year</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">{selectedCar.manufactureYear}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <Gauge size={18} />
                  <p className="text-sm">Mileage</p>
                </div>
                <p className="mt-1 text-lg font-semibold text-gray-900">{selectedCar.mileage.toLocaleString()} km</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <Tag size={18} />
                  <p className="text-sm">Category</p>
                </div>
                <p className="mt-1 text-lg font-semibold text-gray-900">{selectedCar.category?.name ?? "Unknown"}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Rental Price</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  ${toNumber(selectedCar.category?.pricePerDay).toLocaleString()} / day
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
              {selectedCar.status === "available"
                ? "This vehicle is available for new rentals."
                : "This vehicle is not available for a new rental until its status changes to available."}
            </div>

            {isAdmin ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCar(null);
                    handleEdit(selectedCar);
                  }}
                  className="flex-1 rounded-lg bg-blue-600 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Edit Car
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = selectedCar.id;
                    setSelectedCar(null);
                    void handleDelete(id);
                  }}
                  className="flex-1 rounded-lg bg-red-50 py-2 font-medium text-red-700 transition-colors hover:bg-red-100"
                >
                  Delete Car
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>

      {isAdmin ? <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCar ? "Edit Car" : "Add New Car"}>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (optional)</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/car-photo.jpg"
            />
            <p className="mt-2 text-sm text-gray-500">
              Paste a direct image link. If empty, the system shows a generated placeholder.
            </p>
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
      </Modal> : null}
    </div>
  );
}
