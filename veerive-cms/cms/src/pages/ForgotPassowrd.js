
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../config/axios";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/users/forgot-password", { email });
            toast.success(response.data.message || "Reset link sent to your email!", { autoClose: 2000 });
            navigate("/login");
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Something went wrong. Please try again.";
            toast.error(errorMessage, { autoClose: 3000 });
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
                <h2 style={{ marginBottom: "15px", fontWeight: "bold" }}>Forgot Password</h2>
                
                <p style={{ marginBottom: "15px", fontSize: "14px", color: "#555" }}>
                    Write your email address to reset password
                </p>

                <form onSubmit={handleForgotPassword} style={{ display: "flex", flexDirection: "column" }}>
                    <input name="enteryouremail" id="enteryouremail" type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        Send Reset Link
                    </button>
                </form>
            </div>
        </div>
    );
}
