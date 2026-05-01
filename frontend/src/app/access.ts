import { UserRole } from "./api";

const accessByPath: Array<{ prefix: string; roles: UserRole[] }> = [
  { prefix: "/employees", roles: ["admin"] },
  { prefix: "/car-categories", roles: ["admin"] },
  { prefix: "/services", roles: ["admin"] },
  { prefix: "/payments", roles: ["admin", "operator"] },
  { prefix: "/fines", roles: ["admin", "operator"] },
  { prefix: "/clients", roles: ["admin", "manager"] },
  { prefix: "/cars", roles: ["admin", "manager"] },
  { prefix: "/rentals", roles: ["admin", "manager", "operator"] },
  { prefix: "/", roles: ["admin", "manager", "operator"] },
];

export function canAccessPath(role: UserRole, path: string): boolean {
  const rule = accessByPath.find((item) => path === item.prefix || (item.prefix !== "/" && path.startsWith(item.prefix)));
  return rule ? rule.roles.includes(role) : false;
}
