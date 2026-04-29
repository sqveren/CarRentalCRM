import { useEffect, useState } from "react";
import { Eye, Plus } from "lucide-react";
import { Link } from "react-router";
import {
  ApiCar,
  ApiClient,
  ApiEmployee,
  ApiRental,
  ApiService,
  RentalStatus,
  carsApi,
  clientsApi,
  employeesApi,
  rentalsApi,
  servicesApi,
  toDateInputValue,
  toDateTimeLabel,
  toNumber,
} from "../api";
import Badge from "../components/Badge";
import Modal from "../components/Modal";

type RentalFormState = {
  clientId: string;
  carId: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  startMileage: string;
  endMileage: string;
  status: RentalStatus;
  serviceIds: number[];
};

const initialFormData = (): RentalFormState => ({
  clientId: "",
  carId: "",
  employeeId: "",
  startDate: "",
  endDate: "",
  startMileage: "",
  endMileage: "",
  status: "pending",
  serviceIds: [],
});

export default function Rentals() {
  const [rentals, setRentals] = useState<ApiRental[]>([]);
  const [cars, setCars] = useState<ApiCar[]>([]);
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [employees, setEmployees] = useState<ApiEmployee[]>([]);
  const [services, setServices] = useState<ApiService[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<RentalFormState>(initialFormData);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    try {
      setError("");
      const [rentalsData, carsData, clientsData, employeesData, servicesData] = await Promise.all([
        rentalsApi.list(),
        carsApi.list(),
        clientsApi.list(),
        employeesApi.list(),
        servicesApi.list(),
      ]);

      setRentals(rentalsData);
      setCars(carsData);
      setClients(clientsData);
      setEmployees(employeesData);
      setServices(servicesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load rentals.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setError("");

      await rentalsApi.create({
        clientId: Number(formData.clientId),
        carId: Number(formData.carId),
        employeeId: Number(formData.employeeId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        startMileage: formData.startMileage === "" ? undefined : Number(formData.startMileage),
        endMileage: formData.endMileage === "" ? undefined : Number(formData.endMileage),
        status: formData.status,
        serviceIds: formData.serviceIds,
      });

      await loadData();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create rental.");
    }
  }

  function closeModal() {
    setIsModalOpen(false);
    setFormData(initialFormData());
  }

  const totalPages = Math.ceil(rentals.length / itemsPerPage);
  const paginatedRentals = rentals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const availableCars = cars.filter((car) => car.status === "available");

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Rentals Management</h1>
          <p className="text-gray-600">Track and manage all rental bookings</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Create Rental
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Car</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedRentals.map((rental) => {
                const client = rental.client ?? clients.find((item) => item.id === rental.clientId);
                const car = rental.car ?? cars.find((item) => item.id === rental.carId);
                const employee = rental.employee ?? employees.find((item) => item.id === rental.employeeId);

                return (
                  <tr key={rental.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client ? `${client.firstName} ${client.lastName}` : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {car ? `${car.brand} ${car.model}` : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {employee ? `${employee.firstName} ${employee.lastName}` : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{toDateTimeLabel(rental.startDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{toDateTimeLabel(rental.endDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge status={rental.status} variant="rental" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${toNumber(rental.totalPrice).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/rentals/${rental.id}`}
                        className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                      >
                        <Eye size={18} />
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, rentals.length)} of {rentals.length} rentals
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Create New Rental">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.firstName} {client.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select an employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName} ({employee.role?.name ?? "staff"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Car</label>
            <select
              value={formData.carId}
              onChange={(e) => setFormData({ ...formData, carId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a car</option>
              {availableCars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.brand} {car.model} - ${toNumber(car.category?.pricePerDay).toLocaleString()}/day
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: toDateInputValue(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: toDateInputValue(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Mileage</label>
              <input
                type="number"
                value={formData.startMileage}
                onChange={(e) => setFormData({ ...formData, startMileage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Mileage</label>
              <input
                type="number"
                value={formData.endMileage}
                onChange={(e) => setFormData({ ...formData, endMileage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as RentalStatus })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Services</label>
            <div className="grid grid-cols-1 gap-2 rounded-lg border border-gray-200 p-3">
              {services.map((service) => (
                <label key={service.id} className="flex items-center gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.serviceIds.includes(service.id)}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        serviceIds: e.target.checked
                          ? [...current.serviceIds, service.id]
                          : current.serviceIds.filter((id) => id !== service.id),
                      }))
                    }
                  />
                  <span>
                    {service.name} (${toNumber(service.price).toLocaleString()})
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create Rental
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
