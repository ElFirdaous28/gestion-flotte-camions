import { useState } from "react";
import { useSelector } from "react-redux";
import { useUsers } from "../../hooks/useUsers";
import { toast } from 'react-toastify';
import { Eye, EyeOff, Lock } from "lucide-react";

export default function ChangePassword() {
    const { user } = useSelector(state => state.user);
    const { changePassword } = useUsers();

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // New state to hold the server error for the input field
    const [serverError, setServerError] = useState("");

    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [strength, setStrength] = useState(0);

    const toggleShow = (field) => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleChange = (e) => {
        const { id, value } = e.target;

        // Clear server error if user types in current password field
        if (id === "currentPassword") setServerError("");

        setFormData(prev => ({ ...prev, [id]: value }));

        if (id === "newPassword") {
            calculateStrength(value);
        }
    };

    const calculateStrength = (pass) => {
        let score = 0;
        if (pass.length > 6) score++;
        if (pass.length > 10) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        setStrength(Math.min(score, 4));
    };

    const getStrengthColor = () => {
        if (formData.newPassword.length === 0) return "bg-gray-200";
        if (strength < 2) return "bg-red-500";
        if (strength < 3) return "bg-yellow-500";
        return "bg-green-500";
    };

    const getStrengthText = () => {
        if (formData.newPassword.length === 0) return "";
        if (strength < 2) return "Weak";
        if (strength < 3) return "Medium";
        return "Strong";
    };

    const isMatch = formData.newPassword === formData.confirmPassword && formData.confirmPassword !== "";

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isMatch || strength < 2) return;

        try {
            await changePassword.mutateAsync({
                id: user._id,
                data: {
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                }
            });

            toast.success("Password updated successfully");
            setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setStrength(0);
            setServerError(""); // Clear errors on success
        } catch (err) {
            const errorMsg = err.response?.data?.message;

            // Check if it's the specific password error from your controller
            if (errorMsg === 'Current password is incorrect') {
                setServerError(errorMsg);
            } else {
                // For other errors (like 404 or missing fields), show toast
                toast.error(errorMsg || "Error updating password");
            }
        }
    };

    // Helper to conditionally get border color
    const getInputClass = (hasError) => `w-full px-4 py-3 pr-12 rounded-lg border ${hasError ? 'border-red-500 focus:ring-red-200' : 'border-border focus:ring-primary focus:border-primary'} bg-background text-text focus:outline-none focus:ring-2 transition-colors`;

    return (
        <div className="w-[90%] max-w-7xl mx-auto p-10 bg-surface">
            <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center text-white">
                    <Lock size={32} />
                </div>
                <h2 className="text-3xl font-bold text-text">Change Password</h2>
                <p className="mt-2 text-text-muted">Ensure you use a strong and secure password</p>
            </div>

            <form
                className="rounded-lg shadow-md p-6 space-y-6 bg-surface"
                onSubmit={handleSubmit}>
                {/* Current Password */}
                <div>
                    <label className="block mb-2 font-medium text-text">Current Password *</label>
                    <div className="relative">
                        <input
                            type={showPassword.current ? "text" : "password"}
                            id="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            required
                            placeholder="Enter your current password"
                            className={getInputClass(!!serverError)} />
                        <button
                            type="button"
                            onClick={() => toggleShow('current')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showPassword.current ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {/* Display Server Error Here */}
                    {serverError && (
                        <p className="text-sm text-red-600 mt-2 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                            ⚠ {serverError}
                        </p>
                    )}
                </div>

                {/* New Password */}
                <div>
                    <label className="block mb-2 font-medium text-text">New Password *</label>
                    <div className="relative">
                        <input
                            type={showPassword.new ? "text" : "password"}
                            id="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                            placeholder="Enter your new password"
                            className={getInputClass(false)} />
                        <button
                            type="button"
                            onClick={() => toggleShow('new')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {/* Strength Indicator */}
                    {formData.newPassword && (
                        <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-text-muted">Password strength:</span>
                                <span className="text-sm font-semibold text-text">{getStrengthText()}</span>
                            </div>
                            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-300 ${getStrengthColor()}`}
                                    style={{ width: `${(strength / 4) * 100}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block mb-2 font-medium text-text">Confirm New Password *</label>
                    <div className="relative">
                        <input
                            type={showPassword.confirm ? "text" : "password"}
                            id="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Confirm your new password"
                            className={getInputClass(false)} />
                        <button
                            type="button"
                            onClick={() => toggleShow('confirm')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {formData.confirmPassword && (
                        !isMatch ? (
                            <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                                ⚠ Passwords do not match
                            </p>
                        ) : (
                            <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                                ✓ Passwords match
                            </p>
                        )
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-border">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="px-6 py-3 rounded-lg border border-border bg-background text-text hover:opacity-80 transition font-medium">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!isMatch || strength < 2 || changePassword.isLoading}
                        className="px-6 py-3 rounded-lg bg-primary text-white font-semibold shadow-md hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed">
                        {changePassword.isLoading ? 'Updating...' : 'Change Password'}
                    </button>
                </div>

            </form>
        </div>
    );
}