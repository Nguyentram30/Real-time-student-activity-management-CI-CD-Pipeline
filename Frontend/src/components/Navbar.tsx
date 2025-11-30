import { Link } from "react-router-dom";
import { useAuth } from "../UseAuth/AuthContext";

const Navbar = () => {
  const { userData, logout } = useAuth();

  return (
    <nav style={{ padding: "20px" }}>
      {userData ? (
        <div style={{ color: "white", display: "flex", gap: 10 }}>
          <span>Xin chào, {userData.fullName}</span>
          <button onClick={logout}>Đăng xuất</button>
        </div>
      ) : (
        <Link to="/auth">
          <button
            style={{
              background: "linear-gradient(90deg, #001244, #0075FF, #6DB5FF)",
              padding: "14px 26px",
              borderRadius: 14,
              color: "white",
              fontWeight: "bold",
              border: "none"
            }}
          >
            ĐĂNG KÝ / ĐĂNG NHẬP
          </button>
        </Link>
      )}
    </nav>
  );
};

export default Navbar;
