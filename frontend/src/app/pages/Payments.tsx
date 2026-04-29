import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ApiPayment, ApiRental, paymentsApi, rentalsApi, toDateInputValue, toDateTimeLabel, toNumber } from "../api";
import Modal from "../components/Modal";

type PaymentFormState = {
  rentalId: string;
  amount: number;
  paymentDate: string;
};

const initialFormData = (): PaymentFormState => ({
  rentalId: "",
  amount: 0,
  paymentDate: new Date().toISOString().slice(0, 10),
});

export default function Payments() {
  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [rentals, setRentals] = useState<ApiRental[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<PaymentFormState>(initialFormData);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    try {
      setError("");
      const [paymentsData, rentalsData] = await Promise.all([paymentsApi.list(), rentalsApi.list()]);
      setPayments(paymentsData);
      setRentals(rentalsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payments.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setError("");
      await paymentsApi.create({
        rentalId: Number(formData.rentalId),
        amount: formData.amount,
        paymentDate: formData.paymentDate,
      });

      await loadData();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create payment.");
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Are you sure you want to delete this payment?")) {
      return;
    }

    try {
      setError("");
      await paymentsApi.remove(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete payment.");
    }
  }

  function closeModal() {
    setIsModalOpen(false);
    setFormData(initialFormData());
  }

  const totalPages = Math.ceil(payments.length / itemsPerPage);
  const paginatedPayments = payments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payments Management</h1>
          <p className="text-gray-600">Track all rental payments</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Payment
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rental ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Car</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{payment.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">#{payment.rentalId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {payment.rental?.client ? `${payment.rental.client.firstName} ${payment.rental.client.lastName}` : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {payment.rental?.car ? `${payment.rental.car.brand} ${payment.rental.car.model}` : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    ${toNumber(payment.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{toDateTimeLabel(payment.paymentDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button onClick={() => void handleDelete(payment.id)} className="text-red-600 hover:text-red-700">
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, payments.length)} of {payments.length} payments
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Add New Payment">
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
                  Rental #{rental.id} - ${toNumber(rental.totalPrice).toLocaleString()}
                </option>
              ))}
            </select>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: toDateInputValue(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add Payment
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
