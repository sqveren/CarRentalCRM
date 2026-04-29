import { Car, DollarSign, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import {
  ApiCar,
  ApiClient,
  ApiPayment,
  ApiRental,
  carsApi,
  clientsApi,
  paymentsApi,
  rentalsApi,
  toDateTimeLabel,
  toNumber,
} from "../api";

export default function Dashboard() {
  const [cars, setCars] = useState<ApiCar[]>([]);
  const [rentals, setRentals] = useState<ApiRental[]>([]);
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        setError("");
        const [carsData, rentalsData, clientsData, paymentsData] = await Promise.all([
          carsApi.list(),
          rentalsApi.list(),
          clientsApi.list(),
          paymentsApi.list(),
        ]);

        if (!ignore) {
          setCars(carsData);
          setRentals(rentalsData);
          setClients(clientsData);
          setPayments(paymentsData);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
        }
      }
    }

    void loadData();

    return () => {
      ignore = true;
    };
  }, []);

  const availableCars = cars.filter((car) => car.status === "available").length;
  const activeRentals = rentals.filter((rental) => rental.status === "active").length;
  const totalRevenue = payments.reduce((sum, payment) => sum + toNumber(payment.amount), 0);

  const stats = [
    { icon: Car, label: "Total Cars", value: cars.length, color: "bg-blue-500" },
    { icon: Car, label: "Available Cars", value: availableCars, color: "bg-green-500" },
    { icon: FileText, label: "Active Rentals", value: activeRentals, color: "bg-orange-500" },
    { icon: DollarSign, label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, color: "bg-purple-500" },
  ];

  const recentRentals = rentals.slice(0, 5);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's an overview of your car rental business.</p>
      </div>

      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Rentals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Car</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentRentals.map((rental) => {
                const client = rental.client ?? clients.find((item) => item.id === rental.clientId);
                const car = rental.car ?? cars.find((item) => item.id === rental.carId);

                return (
                  <tr key={rental.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client ? `${client.firstName} ${client.lastName}` : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {car ? `${car.brand} ${car.model}` : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {toDateTimeLabel(rental.startDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {toDateTimeLabel(rental.endDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rental.status === "active"
                            ? "bg-blue-100 text-blue-700"
                            : rental.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {rental.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${toNumber(rental.totalPrice).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
