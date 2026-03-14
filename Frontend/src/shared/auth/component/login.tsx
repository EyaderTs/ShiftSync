import { Button, Checkbox, Form, Image, Input, Typography } from "antd";
import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import AuthContext from "../context/authContext";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/app.store";
import bgImage from "../../../../public/assets/images/login-bg.png"

const { Title } = Typography;

interface Account {
  email: string;
  password: string;
}

export function Login() {
  const navigate = useNavigate();
  const isLoading = useSelector(
    (state: RootState) => state.authReducer.loading
  );
  const { login } = useContext(AuthContext);

  function onSubmit(data: Account) {
    login(data);
  }

  return (
    <div className="flex bg-white h-screen">
      {/* Left Side: Blue overlay with image and app name, hidden on small screens */}
      <div
        className="hidden md:flex md:ml-10 md:my-8 rounded-4xl flex-1 items-center justify-center relative"
        style={{
          background: `linear-gradient(rgba(66, 133, 244, 0.55), rgba(66, 133, 244, 0.65)), url(${bgImage}) center/cover no-repeat`,
        }}
      >
        <div className="text-white text-6xl font-bold z-10">
          Shift Sync
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-8 py-10 rounded shadow-lg">
          <Title level={2} className="mb-2 font-semibold">
            Welcome Back <span role="img" aria-label="wave" className="text-blue-800">👋</span>
          </Title>
          <p className="mb-6 text-gray-500">Please enter your detail</p>
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={(values) => onSubmit({ ...values } as Account)}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please input your email or username!" },
              ]}
            >
              <Input placeholder="Email address" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>

            <div className="flex justify-between items-center mb-8">
              <span className="text-sm text-gray-500">Did you forget your password?</span>
              <NavLink
                to="/reset-password"
                className="text-sm font-normal  hover:text-primary"
              >
                Forget Password
              </NavLink>
            </div>

            <Button
              className=" w-full rounded shadow"
              htmlType="submit"
              type="primary"
              loading={isLoading}
            >
              Log in
            </Button>
          </Form>

        </div>
      </div>
    </div>
  );
}

export default Login;
