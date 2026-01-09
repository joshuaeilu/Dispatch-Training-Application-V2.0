import  { useState, useContext } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Typography,
  Upload,
  Image,
} from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../../contexts/AuthProvider';
import { api } from '../../../../utils/api';
import type { UploadFile, UploadProps, GetProp } from 'antd';
import { toast } from 'react-hot-toast';
import { getUsers } from '../../../../contexts/UniversalHelpers';
import { Page } from 'react-pdf';
import { PageHeader } from '../../../Shared/PageHeader';
import { PageBreadcrumbs } from '../../../Shared/Breadcrumbs';
const { Title } = Typography;
const roles = ['dispatcher', 'trainee', 'admin'];

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export default function CreateUserPage() {
  const { user } = useContext(AuthContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUsers, users } = getUsers();

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newList }) => {
    const latest = newList.slice(-1);
    setFileList(latest);
    setImageFile(latest[0]?.originFileObj || null);
  };

const handleFinish = async (values: any) => {
  if (!user || user.role !== 'admin') {
    toast.error('You do not have permission to create a user.');
    return;
  }

  setLoading(true);
  const formData = new FormData();
  formData.append('username', values.username);
  formData.append('password', values.password);
  formData.append('role', values.role);

  // ✅ If imageFile exists, attach it
  if (imageFile) {
    formData.append('profileImage', imageFile);
  } else {
    // ✅ No image — send null string or empty field so server knows
    formData.append('profileImage', '');
  }

  try {
    const res = await api.post('/auth/signup', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    setUsers([...users, {
      id: res.data.id,
      name: res.data.username,
      role: res.data.role,
      avatar: res.data.avatar,
    }]);
    

    toast.success('User created successfully!');
    form.resetFields();
    setFileList([]);
    setImageFile(null);
    navigate('/dashboard', { replace: true });
  } catch (err: any) {
    toast.error(err?.response?.data?.error||err?.message || 'Failed to create a user.');
  } finally {
    setLoading(false);
  }
};


  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <div>
      <PageHeader title="Create New User" subtitle='Add a new User to the Training System'  />
      <PageBreadcrumbs items={[{name: 'Create User', current: true}]} />


        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          style={{ width: '100%' }}
          autoComplete="off"
        >
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select placeholder="Select role">
              {roles.map((role) => (
                <Select.Option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please enter a username' }]}
          >
            <Input placeholder="Enter username" autoComplete='new-username' />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter a password' }]}
          >
            <Input.Password placeholder="Enter password" autoComplete='new-password' />
          </Form.Item>

          <Form.Item label="Profile Image (from your computer)">
            <Upload
              accept="image/*"
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleChange}
              beforeUpload={() => false}
              maxCount={1}
            >
              {fileList.length >= 1 ? null : uploadButton}
            </Upload>

            {previewImage && (
              <Image
                wrapperStyle={{ display: 'none' }}
                preview={{
                  visible: previewOpen,
                  onVisibleChange: (visible) => setPreviewOpen(visible),
                  afterOpenChange: (visible) => !visible && setPreviewImage(''),
                }}
                src={previewImage}
              />
            )}
          </Form.Item>

          <Form.Item style={{ marginTop: '2rem' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
            >
              Create User
            </Button>
          </Form.Item>
        </Form>
    </div>
  );
}
