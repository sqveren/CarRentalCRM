import { useEffect, useState } from "react";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { ApiClient, clientsApi } from "../api";
import Modal from "../components/Modal";

type ClientFormState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  documentNumber: string;
};

const initialFormData = (): ClientFormState => ({
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  documentNumber: "",
});

export default function Clients() {
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ApiClient | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState<ClientFormState>(initialFormData);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    void loadClients();
  }, []);

  async function loadClients() {
    try {
      setError("");
      setClients(await clientsApi.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clients.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setError("");

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || null,
        email: formData.email || null,
        documentNumber: formData.documentNumber || null,
      };

      if (editingClient) {
        await clientsApi.update(editingClient.id, payload);
      } else {
        await clientsApi.create(payload);
      }

      await loadClients();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save client.");
    }
  }

  function handleEdit(client: ApiClient) {
    setEditingClient(client);
    setFormData({
      firstName: client.firstName,
      lastName: client.lastName,
      phone: client.phone ?? "",
      email: client.email ?? "",
      documentNumber: client.documentNumber ?? "",
    });
    setIsModalOpen(true);
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Are you sure you want to delete this client?")) {
      return;
    }

    try {
      setError("");
      await clientsApi.remove(id);
      await loadClients();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete client.");
    }
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingClient(null);
    setFormData(initialFormData());
  }

  const query = searchQuery.toLowerCase();
  const filteredClients = clients.filter((client) =>
    client.firstName.toLowerCase().includes(query) ||
    client.lastName.toLowerCase().includes(query) ||
    (client.email ?? "").toLowerCase().includes(query) ||
    (client.phone ?? "").includes(searchQuery) ||
    (client.documentNumber ?? "").toLowerCase().includes(query),
  );

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Clients Management</h1>
          <p className="text-gray-600">Manage your customer database</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Client
        </button>
      </div>

      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search clients by name, email, phone, or document..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.firstName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{client.phone ?? "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{client.email ?? "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{client.documentNumber ?? "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(client)} className="text-blue-600 hover:text-blue-700">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => void handleDelete(client.id)} className="text-red-600 hover:text-red-700">
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredClients.length)} of {filteredClients.length} clients
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingClient ? "Edit Client" : "Add New Client"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+380..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="client@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Document Number</label>
            <input
              type="text"
              value={formData.documentNumber}
              onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="DL-100001"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {editingClient ? "Update Client" : "Add Client"}
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
