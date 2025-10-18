import {
  Input,
  Button,
  List,
  Popconfirm,
  Tag,
  Tooltip,
  Space,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useState } from 'react';

interface SceneOptionsEditorProps {
  options: string[];
  correctOption: string | null;
  onChange: (updatedOptions: string[]) => void;
  onCorrectChange: (option: string | null) => void;
}

export default function SceneOptionsEditor({
  options,
  correctOption,
  onChange,
  onCorrectChange,
}: SceneOptionsEditorProps) {
  const [newOption, setNewOption] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const addOption = () => {
    if (newOption.trim()) {
      onChange([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value.trim();
    onChange(updated);

    if (correctOption === options[index]) {
      onCorrectChange(value.trim());
    }
  };

  const deleteOption = (index: number) => {
    const removed = options[index];
    const updated = options.filter((_, i) => i !== index);
    onChange(updated);

    if (correctOption === removed) {
      onCorrectChange(null);
    }
  };

  return (
    <>
      <Space.Compact style={{ width: '100%', marginBottom: 8, marginTop: 8 }} >
        <Input
          placeholder="Type an option and press Enter"
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          onPressEnter={(e) => {
            e.preventDefault();
            addOption();
          }}
        />
        <Button type="dashed" icon={<PlusOutlined />} onClick={addOption}>
          Add
        </Button>
      </Space.Compact>

      <List
        bordered
        dataSource={options}
        locale={{ emptyText: 'No options yet' }}
        renderItem={(option, index) => (
          <List.Item
            actions={[
              correctOption === option ? (
                <Tag
                  className="cursor-pointer"
                  color="green"
                  onClick={() => onCorrectChange(null)}
                >
                  Correct
                </Tag>
              ) : (
                <Tooltip title="Mark correct">
                  <Button
                    type="link"
                    icon={<CheckCircleOutlined />}
                    onClick={() => onCorrectChange(option)}
                  />
                </Tooltip>
              ),

              <Tooltip title="Edit option">
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditIndex(index);
                    setEditValue(option);
                  }}
                />
              </Tooltip>,

              <Tooltip title="Delete option">
                <Popconfirm
                  title="Delete this option?"
                  onConfirm={() => deleteOption(index)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button danger type="link" icon={<DeleteOutlined />} />
                </Popconfirm>
              </Tooltip>,
            ]}
          >
            {editIndex === index ? (
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onPressEnter={(e) => {
                    e.preventDefault();
                    updateOption(index, editValue);
                    setEditIndex(null);
                    setEditValue('');
                  }}
                />
                <Button
                  type="primary"
                  onClick={() => {
                    updateOption(index, editValue);
                    setEditIndex(null);
                    setEditValue('');
                  }}
                >
                  Save
                </Button>
              </Space.Compact>
            ) : (
              option
            )}
          </List.Item>
        )}
      />
      </>
  );
}
