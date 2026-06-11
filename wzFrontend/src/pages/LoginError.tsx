import { Link, useSearchParams } from "react-router-dom";

export function LoginError() {
    const [searchParams] = useSearchParams();
    const error = searchParams.get("error");

    const getErrorMessage = () => {
        switch (error) {
            case "userNotFound":
                return "Your account was not found in our database. Please contact an administrator.";
            case "auth_failed":
                return "Authentication with Google failed. Please try again.";
            case "no_user_info":
                return "We couldn't retrieve your user information from Google.";
            default:
                return "An unexpected error occurred during login.";
        }
    };

    return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-brand-surface border border-brand-border p-8 rounded shadow-sm text-center">
                <div className="w-16 h-16 bg-status-canceled-bg rounded-full mx-auto mb-6 flex items-center justify-center">
                    <svg
                        className="w-8 h-8 text-status-canceled-fg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold mb-4 uppercase tracking-tight text-brand-fg">
                    Login Error
                </h1>
                <p className="text-brand-muted mb-8 leading-relaxed">
                    {getErrorMessage()}
                </p>
                <Link
                    to="/login"
                    className="inline-block w-full px-6 py-3 bg-brand-fg text-white rounded font-semibold transition-all duration-150 hover:bg-black"
                >
                    Return to Login
                </Link>
            </div>
        </div>
    );
}
