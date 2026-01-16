import { useContext, useState } from "react";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import CSLOGO from "../../assets/cs_logo.png";
import { AuthContext } from "../../contexts/AuthProvider";
import { useToast } from "../../contexts/ToastContext";

export default function LoginPage() {
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();
  const onFinish = async (values: { username: string; password: string }) => {
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error((await res.json()).error);
      const { token, user } = await res.json();
      setAuth(token, user);
      navigate("/", { replace: true });
    } catch (error) {
      const err = error instanceof Error ? error.message : "Login failed";
      toast.error(err); // or console.error(err)
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values = {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    };
    onFinish(values);
  };

  return (
    <div className="flex min-h-screen flex-col justify-start px-6 pt-24 pb-16 lg:px-8">

      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img src={CSLOGO} alt="CS Logo" className="mx-auto h-30 w-auto" />
        <h2 className="mt-10 text-center text-3xl font-bold tracking-tight text-gray-900">
          Dispatch Training Application
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-900">
              Username
            </label>
            <div className="mt-2">
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-brand-maroon sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-900">
              Password
            </label>
            <div className="mt-2 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                className="block w-full rounded-md bg-white px-3 py-1.5 pr-10 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-brand-maroon sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-sm text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-brand-maroon px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-brand-maroon-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-maroon-light"
            >
              Sign in
            </button>
          </div>
        </form>
        

        
      </div>
    </div>
  );
}
