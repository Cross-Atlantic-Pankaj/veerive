
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../config/axios";

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const query = new URLSearchParams(useLocation().search);
    const token = query.get("token"); // Extract token from URL
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/users/reset-password", { token, newPassword });
            toast.success(response.data.message || "Password reset successfully!", { autoClose: 2000 });
            navigate("/login"); // Redirect to login page after successful reset
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Something went wrong. Please try again.";
            toast.error(errorMessage, { autoClose: 3000 });
            setMessage(errorMessage);
        }
    };

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "#f4f4f4"
        }}>
            <div style={{
                backgroundColor: "white",
                padding: "30px",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                textAlign: "center",
                width: "350px"
            }}>
                <h2 style={{ marginBottom: "15px", fontWeight: "bold" }}>Reset Password</h2>

                <p style={{ marginBottom: "15px", fontSize: "14px", color: "#555" }}>
                    Type Your New Password To Reset:
                </p>

                <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column" }}>
                    <input name="enternewpassword" id="enternewpassword" type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        style={{
                            padding: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                            marginBottom: "15px",
                            fontSize: "14px"
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            padding: "10px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontSize: "16px",
                            fontWeight: "bold",
                            transition: "background 0.3s"
                        }}
                        onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
                        onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
                    >
                        Reset Password
                    </button>
                </form>

                {message && (
                    <p style={{ color: "red", marginTop: "10px", fontSize: "14px" }}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}
