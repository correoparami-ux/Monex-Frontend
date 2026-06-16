import { useEffect, useState } from "react";
import { SideBar } from "./SideBar";
import { SideBarAdmin } from "./SideBarAdmin";

const AUTH_ME_URL = `${import.meta.env.VITE_USERS_API_URL}/api/auth/me`;

function getRoleFromSession() {
  try {
    const raw = sessionStorage.getItem("usuario");
    if (!raw) return null;

    const data = JSON.parse(raw);

    return data.role || data.rol || data.tipo || null;
  } catch (error) {
    console.error("Error leyendo el rol desde sessionStorage:", error);
    return null;
  }
}

export function SideBarSwitcher() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarRol = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setRole(getRoleFromSession() || "user");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(AUTH_ME_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setRole(getRoleFromSession() || "user");
        } else {
          const data = await response.json();

          setRole(
            data.role ||
              data.rol ||
              data.tipo ||
              getRoleFromSession() ||
              "user"
          );
        }
      } catch (error) {
        console.error("Error al cargar rol de usuario:", error);
        setRole(getRoleFromSession() || "user");
      } finally {
        setLoading(false);
      }
    };

    cargarRol();
  }, []);

  if (loading) {
    return null;
  }

  return role === "admin" ? <SideBarAdmin /> : <SideBar />;
}