interface BadgeProps {
  status: string;
  variant?: "car" | "rental" | "default";
}

const carStatusColors: Record<string, string> = {
  available: "bg-green-100 text-green-700",
  rented: "bg-blue-100 text-blue-700",
  maintenance: "bg-orange-100 text-orange-700",
  cleaning: "bg-purple-100 text-purple-700",
  damaged: "bg-red-100 text-red-700",
};

const rentalStatusColors: Record<string, string> = {
  active: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
};

export default function Badge({ status, variant = "default" }: BadgeProps) {
  let colorClass = "bg-gray-100 text-gray-700";

  if (variant === "car") {
    colorClass = carStatusColors[status.toLowerCase()] || colorClass;
  } else if (variant === "rental") {
    colorClass = rentalStatusColors[status.toLowerCase()] || colorClass;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
}
