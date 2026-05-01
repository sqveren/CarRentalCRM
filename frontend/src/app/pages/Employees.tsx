import { useEffect, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { ApiEmployee, ApiRole, employeesApi, rolesApi } from "../api";
import Modal from "../components/Modal";

type EmployeeFormState = {
  firstName: string;
  lastName: string;
  login: string;
  passwordHash: string;
  roleId: string;
};

const initialFormData = (): EmployeeFormState => ({
  firstName: "",
  lastName: "",
  login: "",
  passwordHash: "",
  roleId: "",
});

export default function Employees() {
  const [employees, setEmployees] = useState<ApiEmployee[]>([]);
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<ApiEmployee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<EmployeeFormState>(initialFormData);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    try {
      setError("");
      const [employeesData, rolesData] = await Promise.all([employeesApi.list(), rolesApi.list()]);
      setEmployees(employeesData);
      setRoles(rolesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load employees.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setError("");
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        login: formData.login,
        roleId: Number(formData.roleId),
        ...(formData.passwordHash ? { passwordHash: formData.passwordHash } : {}),
      };

      if (editingEmployee) {
        await employeesApi.update(editingEmployee.id, payload);
      } else {
        await employeesApi.create({
          ...payload,
          passwordHash: formData.passwordHash,
        });
      }

      await loadData();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save employee.");
    }
  }

  function handleEdit(employee: ApiEmployee) {
    setEditingEmployee(employee);
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      login: employee.login,
      passwordHash: "",
      roleId: String(employee.roleId),
    });
    setIsModalOpen(true);
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      setError("");
      await employeesApi.remove(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete employee.");
    }
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setFormData(initialFormData());
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Employees</h1>
          <p className="text-gray-600">Create employees and assign system roles</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Employee
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {employee.firstName} {employee.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{employee.login}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm capitalize text-gray-600">{employee.role?.name ?? "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(employee)} className="text-blue-600 hover:text-blue-700">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => void handleDelete(employee.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingEmployee ? "Edit Employee" : "Add Employee"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Login</label>
            <input
              value={formData.login}
              onChange={(e) => setFormData({ ...formData, login: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={formData.roleId}
              onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password {editingEmployee ? "(leave empty to keep current)" : ""}
            </label>
            <input
              type="password"
              value={formData.passwordHash}
              onChange={(e) => setFormData({ ...formData, passwordHash: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={!editingEmployee}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              {editingEmployee ? "Update Employee" : "Add Employee"}
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
