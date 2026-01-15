import { useContext, useEffect, useState } from "react";
import {
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
import {
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { toast } from "react-hot-toast";
import { api } from "../../../../../utils/api";
import { PageHeader } from "../../../../Shared/PageHeader";
import { toTitleCase } from "../../../../../utils/tools";
import { PROFILE_PIC_URL } from "../../../../../data/data";
import { AuthContext } from "../../../../../contexts/AuthProvider";
import { getUsers } from "../../../../../contexts/UniversalHelpers";
import type { GetUser } from "../../../../../types/index.types";
import { PageBreadcrumbs } from "../../../../Shared/Breadcrumbs";

const { Title } = Typography;
const { Option } = Select;

export default function ManageUsers() {
  const { token } = useContext(AuthContext);
  const { users: globalUsers } = getUsers();

  const [allUsers, setAllUsers] = useState<GetUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<GetUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // === Edit Modal State ===
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<GetUser | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // === Delete Modal State ===
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [form] = Form.useForm();

  // === Initialize all users from context ===
  useEffect(() => {
    if (Array.isArray(globalUsers)) {
      setAllUsers(globalUsers);
      setFilteredUsers(globalUsers);
    }
  }, [globalUsers, isModalOpen]);

  // === Search + Role Filter Logic ===
  useEffect(() => {
    if (!allUsers.length) return;

    let filtered = [...allUsers];

    if (roleFilter !== "all") {
      filtered = filtered.filter(
        (u) => u.role.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          u.role.toLowerCase().includes(term)
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, allUsers]);

  // === Role Tag UI ===
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

  // === Edit Handlers ===
  const handleEdit = (user: GetUser) => {
    setSelectedUser(user);
    setPreview(`${PROFILE_PIC_URL}${user.avatar}?token=${token}`);
    form.setFieldsValue({
      username: toTitleCase(user.name),
      role: toTitleCase(user.role),
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

  // === Delete Handlers ===
  const handleDeleteClick = (user: GetUser) => {
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
      setAllUsers(allUsers.filter((u) => u.id !== selectedUser?.id));
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Failed to delete user.";
      toast.error(errorMsg);
    } finally {
      setDeleteLoading(false);
     
    }
  };

  // === Action Menu ===
  const actionMenu = (user: GetUser) => (
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
    <div >
      <PageHeader
        title="User Management"
        subtitle="Manage users, roles, and permissions"
        
      />
      <PageBreadcrumbs items={[{name: 'Users', current: true}]}/>
      <h1>{token}</h1>

<div style={{ margin: "0 1rem"}}>
        {/* Search + Filters */}
      <div className="flex flex-col md:flex-row md:items-center mb-6 gap-3" >
        <Input
          placeholder="Search users by name or role..."
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
      {filteredUsers.length === 0 ? (
        <Empty
          description="No users found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ marginTop: "4rem" }}
        />
      ) : (
      <Row gutter={[24, 24]}>
  {filteredUsers.map((user) => (
  <Col key={user.id} xs={24} sm={12}>
  <div className="group relative cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-1.5 hover:shadow-xl">
    <div className="px-6 py-6 sm:p-7">
      <div className="flex items-start justify-between gap-6">
        
        {/* Left: Avatar + Text */}
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <Avatar
            src={
              user.avatar
                ? `${PROFILE_PIC_URL}${user.avatar}?token=${token}`
                : undefined
            }
            icon={!user.avatar ? <UserOutlined /> : undefined}
            size={60}
            className="shrink-0"
            style={{ color: "#8C2131" }}
          />

          {/* Text */}
          <div className="min-w-0 pt-0.5">
            <Title
              level={4}
              style={{ margin: 0, fontWeight: 600 }}
              className="truncate"
            >
              {toTitleCase(user.name)}
            </Title>

            <div className="mt-2">
              {getRoleTag(user.role)}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-start pt-1">
          <Dropdown overlay={actionMenu(user)} trigger={['click']}>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 group-hover:translate-x-0.5"
              style={{ backgroundColor: "rgba(140, 33, 49, 0.08)" }}
            >
              <MoreOutlined
                className="text-sm"
                style={{ color: "#8C2131" }}
              />
            </div>
          </Dropdown>
        </div>

      </div>
    </div>
  </div>
</Col>

  ))}
</Row>


      )}
</div>

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

        <Form layout="vertical" form={form}>
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
