import { useContext, useEffect, useState } from "react";
import {
  Input,
  Typography,
  Avatar,
  Tag,
  Button,
  Modal,
  Form,
  Upload,
  Select,
} from "antd";
import {
  EditOutlined,
  UploadOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { toast } from "react-hot-toast";
import { api } from "../../../../../utils/api";
import { PageHeader } from "../../../../Shared/PageHeader";
import { PROFILE_PIC_URL } from "../../../../../data/data";
import { AuthContext } from "../../../../../contexts/AuthProvider";
import { getUsers } from "../../../../../contexts/UniversalHelpers";
import type { GetUser, TableColumnDef } from "../../../../../types/index.types";
import { PageBreadcrumbs } from "../../../../Shared/Breadcrumbs";
import { TableViewer } from "../../../../Shared/TableViewer";
import { TableActionButton } from "../../../../Shared/TableActionButton";
import PencilSquareIcon from "@heroicons/react/20/solid/PencilSquareIcon";
import TrashIcon from "@heroicons/react/20/solid/TrashIcon";
import { toTitleCase } from "../../../../../utils/tools";

const { Title } = Typography;
const { Option } = Select;

export default function ManageUsers() {
  const { token } = useContext(AuthContext);
  const { users: globalUsers, setUsers } = getUsers();

  const [allUsers, setAllUsers] = useState<GetUser[]>([]);

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
    }
  }, [globalUsers, isModalOpen]);

  // === Table Columns ===
  const userColumns: TableColumnDef<GetUser>[] = [
    {
      key: 'avatar',
      header: 'User',
      render: (user: GetUser) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={
              user.avatar
                ? `${PROFILE_PIC_URL}${user.avatar}?token=${token}`
                : undefined
            }
            icon={!user.avatar ? <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-brand-maroon-light/10 border border-brand-maroon-light/30">
      <span className="text-lg sm:text-xl font-semibold text-brand-maroon">
        {user.name
          .split(" ")
          .map((word) => word[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()}
      </span>
    </div> : undefined}
            size={32}
            style={{ color: "#8C2131" }}
          />
          <span className="font-medium text-gray-900">{toTitleCase(user.name)}</span>
        </div>
      ),
      searchable: true,
    },
    {
      key: 'role',
      header: 'Role',
      render: (user: GetUser) => {
        switch (user.role.toLowerCase()) {
          case "admin":
            return <Tag color="#8C2131">Admin</Tag>;
          case "dispatcher":
            return <Tag color="#F3CD00">Dispatcher</Tag>;
          case "trainee":
            return <Tag color="#A2D683">Trainee</Tag>;
          default:
            return <Tag>{user.role}</Tag>;
        }
      },
      filterable: true,
    },
    {
      header: 'Actions',
      align: 'text-center',
      render: (user: GetUser) => (
        <div className="flex justify-end gap-2">
          <TableActionButton
            icon={PencilSquareIcon}
            title="Edit"
            color="blue"
            onPress={() => handleEdit(user)}
          />
          <TableActionButton
            icon={TrashIcon}
            title="Delete"
            color="red"
            onPress={() => handleDeleteClick(user)}
          />
        </div>
      )
    }
  ];

  // === Filter Options ===
  const userFilterOptions = {
    role: ['admin', 'dispatcher', 'trainee'],
  };

  // === Edit Handlers ===
  const handleEdit = (user: GetUser) => {
    setSelectedUser(user);
    setPreview(`${PROFILE_PIC_URL}${user.avatar}?token=${token}`);
    form.setFieldsValue({
      username: toTitleCase(user.name),
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

      // Refresh the users list
      const response = await api.get('/users');
      setUsers(response.data);

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

      // Refresh the users list
      const response = await api.get('/users');
      setUsers(response.data);

      toast.success("User deleted successfully");
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Failed to delete user.";
      toast.error(errorMsg);
    } finally {
      setDeleteLoading(false);
     
    }
  };

  // === Action Menu ===
 

  return (
    <>
      <PageHeader
        title="User Management"
        subtitle="Manage users, roles, and permissions"
      />
      <PageBreadcrumbs items={[{name: 'Users', current: true}]}/>

      <TableViewer
        tableType="User"
        columnDefinitions={userColumns}
        columnData={allUsers}
        filterOptions={userFilterOptions}
        onButtonPress={() => {/* Could navigate to create user page */}}
      />

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
    </>
  );
}
