import { useContext, useEffect, useState } from "react";
import {
  Card,
  Input,
  Dropdown,
  Menu,
  Typography,
  Avatar,
  Tag,
  Row,
  Col,
  Select,
  Empty,
  Button,
  Modal,
  Form,
  Upload,
} from "antd";
import { toast } from "react-hot-toast";
import {
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
  LockOutlined,
  BackwardOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { api } from "../../../../utils/api";
import { PageHeader } from "../../../Shared/PageHeader";
import { toTitleCase } from "../../../../utils/tools";
import { PROFILE_PIC_URL } from "../../../../data/data";
import { AuthContext } from "../../../../contexts/AuthProvider";

const { Title } = Typography;
const { Option } = Select;

interface EditUser {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export default function ManageUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [allUsers, setAllUsers] = useState<EditUser[]>([]);
  const [users, setUsers] = useState<EditUser[]>([]);

  // === Edit Modal State ===
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<EditUser | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // === Delete Modal State ===
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { token } = useContext(AuthContext);
  const [form] = Form.useForm();

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setAllUsers(response.data);
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Search + Filter logic
  useEffect(() => {
    let filtered = [...allUsers];
    if (roleFilter !== "all") {
      filtered = filtered.filter(
        (user) => user.role.toLowerCase() === roleFilter
      );
    }
    const term = searchTerm.toLowerCase();
    if (term) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(term) ||
          user.role.toLowerCase().includes(term)
      );
    }
    setUsers(filtered);
  }, [searchTerm, roleFilter, allUsers]);

  // Role Tag UI
  const getRoleTag = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return <Tag color="#8C2131">Admin</Tag>;
      case "dispatcher":
        return <Tag color="#F3CD00">Dispatcher</Tag>;
      case "trainee":
        return <Tag color="#A2D683">Trainee</Tag>;
      default:
        return <Tag>{toTitleCase(role)}</Tag>;
    }
  };

  // === Edit User Modal ===
  const handleEdit = (user: EditUser) => {
    setSelectedUser(user);
    setPreview(`${PROFILE_PIC_URL}${user.avatar}?token=${token}`);
    form.setFieldsValue({
      username: user.name,
      role: user.role,
      password: "",
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    try {
      const values = await form.validateFields();
      const formData = new FormData();

      if (values.username) formData.append("username", values.username);
      if (values.password) formData.append("password", values.password);
      if (values.role) formData.append("role", values.role);
      if (imageFile) formData.append("profileImage", imageFile);

      await api.put(`/users/${selectedUser.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("User updated successfully");
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Failed to update user.";
      toast.error(errorMsg);
    }
  };

  const handleImageChange = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    return false;
  };

  // === Delete User Modal ===
  const handleDeleteClick = (user: EditUser) => {
    setSelectedUser(user);
    setDeletePassword("");
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletePassword) {
      toast.error("Please enter your password to confirm.");
      return;
    }

    setDeleteLoading(true);
    try {
      await api.post(`/users/${selectedUser?.id}/delete`, {
        password: deletePassword,
      });

      toast.success("User deleted successfully");
      setIsDeleteModalOpen(false);
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser?.id));
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Failed to delete user.";
      toast.error(errorMsg);
    } finally {
      setDeleteLoading(false);
    }
  };

  // === Menu Actions ===
  const actionMenu = (user: EditUser) => (
    <Menu>
      <Menu.Item
        key="edit"
        icon={<EditOutlined />}
        onClick={() => handleEdit(user)}
      >
        Edit User
      </Menu.Item>
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        danger
        onClick={() => handleDeleteClick(user)}
      >
        Delete User
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="px-8 py-6">
  <PageHeader
    title="User Management"
    subtitle="Manage users, roles, and permissions"
    showBackButton
    onBack={() => window.history.back()}
  />
  

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row md:items-center mb-6 gap-3">
        <Input
          placeholder="Search users by name, email, or role..."
          prefix={<SearchOutlined style={{ color: "#999" }} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          className="flex-1"
          size="large"
        />
        <Select
          value={roleFilter}
          onChange={(val) => setRoleFilter(val)}
          className="w-full md:w-48"
          size="large"
        >
          <Option value="all">All Roles</Option>
          <Option value="admin">Admin</Option>
          <Option value="dispatcher">Dispatcher</Option>
          <Option value="trainee">Trainee</Option>
        </Select>
      </div>

      {/* User Cards */}
      {users.length === 0 ? (
        <Empty
          description="No users found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ marginTop: "4rem" }}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {users.map((user) => (
            <Col key={user.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                className="shadow-lg rounded-xl relative transition-all duration-200 hover:shadow-2xl"
                bodyStyle={{
                  padding: "2rem 1rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <div className="absolute top-3 right-3">
                  <Dropdown overlay={actionMenu(user)} trigger={["click"]}>
                    <Button
                      type="text"
                      icon={<MoreOutlined style={{ fontSize: 22 }} />}
                      style={{
                        borderRadius: 6,
                        padding: "4px 10px",
                      }}
                    />
                  </Dropdown>
                </div>
                <Avatar
                  src={`${PROFILE_PIC_URL}${user.avatar}?token=${token}`}
                  size={96}
                  className="border mb-3"
                />
                <Title level={4}>{toTitleCase(user.name)}</Title>
                <div>{getRoleTag(user.role)}</div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* === Edit Modal === */}
      <Modal
        open={isModalOpen}
        centered
        footer={null}
        width={560}
        closable={false}
        bodyStyle={{ padding: "12px 16px", maxHeight: "80vh", overflowY: "auto" }}
      >
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <EditOutlined style={{ fontSize: 22, color: "#8C2131" }} />
            <Title level={4} style={{ margin: 0 }}>
              Edit User
            </Title>
          </div>
          <Typography.Text type="secondary">
            Update username, password, role, or profile picture.
          </Typography.Text>
        </div>

        <Form layout="vertical" form={form} className="space-y-3">
          <Form.Item label="Username" name="username">
            <Input placeholder="Enter new username" size="large" />
          </Form.Item>
          <Form.Item label="Password" name="password">
            <Input.Password placeholder="Enter new password" size="large" />
          </Form.Item>
          <Form.Item label="Role" name="role">
            <Select placeholder="Select role" size="large">
              <Option value="admin">Admin</Option>
              <Option value="dispatcher">Dispatcher</Option>
              <Option value="trainee">Trainee</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Profile Picture">
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={(file) => handleImageChange(file)}
            >
              <Button icon={<UploadOutlined />}>Upload New Image</Button>
            </Upload>
            {preview && (
              <div className="flex justify-center mt-4">
                <Avatar src={preview} size={96} />
              </div>
            )}
          </Form.Item>
          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>

      {/* === Delete Modal === */}
      <Modal
        open={isDeleteModalOpen}
        centered
        onCancel={() => setIsDeleteModalOpen(false)}
        footer={null}
        width={420}
      >
        <div className="mb-4">
          <Title level={4} style={{ marginBottom: 8 }}>
            Confirm Deletion
          </Title>
          <Typography.Text type="danger">
            Deleting <b>{selectedUser?.name}</b> is permanent. Please enter your
            password to confirm.
          </Typography.Text>
        </div>

        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Enter your password"
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
          size="large"
        />

        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
          <Button
            danger
            type="primary"
            onClick={confirmDelete}
            loading={deleteLoading}
            disabled={!deletePassword}
          >
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
