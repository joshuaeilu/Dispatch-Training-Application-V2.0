import { useContext} from "react";
import { Form, Input, Button, Typography, message } from "antd";
import CSLOGO from "../../assets/cs_logo.png"
import { AuthContext } from "../../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";



const { Title } = Typography;

export default function LoginPage() {
    const { setAuth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

  // Handle Login Form Submission
  const onFinish = async (values: any) => {
    try{
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: values.username, password: values.password }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const { token, user } = await res.json();
      setAuth(token, user);
      navigate('/', { replace: true });
    } catch (error) {
      messageApi.error( error instanceof Error ? error.message : "Login failed");
      console.error("Login error:", error);
    }
  };


  return (
    <div style={{  maxWidth: 300, margin: "80px auto", textAlign: "center" }}>
      {/* Logo */}
      <div
      style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
      <img
        src={CSLOGO}
        alt="Campus Safety App Logo"
        style={{ width: 150, marginBottom: 14 }}
        />
        
              </div>

      <Title level={3}>Dispatch Training Application</Title>

      <Form
        name="login"
        onFinish={onFinish}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: "Please enter your username" }]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please enter your password" }]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Log in
          </Button>
        </Form.Item>
      </Form>
      {contextHolder}
    </div>
  );
}
