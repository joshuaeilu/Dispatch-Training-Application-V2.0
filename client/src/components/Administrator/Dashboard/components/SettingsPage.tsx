import {
    Button,
    Card,
    Input,
    Space,
    Table,
    Popconfirm,
} from "antd";
import {
    DeleteOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { useContext, useState } from "react";
import { PageHeader } from "../../../Shared/PageHeader";
import { UniversalContext } from "../../../../contexts/UniversalHelpers";
import { api } from "../../../../utils/api";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
    const [newExerciseType, setNewExerciseType] = useState("");
    const [newScenarioType, setNewScenarioType] = useState("");
    const { preferences, setPreferences } = useContext(UniversalContext);

    const handleAdd = async (
        label: string,
        value: string,
        field: "exercise_types" | "scenario_types",
        clear: () => void
    ) => {
        if (!value.trim()) return;

        const key = value.trim().toLowerCase().replace(/\s+/g, "-");
        const currentList = preferences?.[field] || [];

        if (currentList.some((item: string) => item.toLowerCase().replace(/\s+/g, "-") === key)) {
            toast.error(`${label} already exists`);
            return;
        }

        const updatedList = [...currentList, value.trim()];

        try {
            await api.patch(`/preferences/${field}`, {
                value: updatedList,
            });

            setPreferences({
                ...preferences!,
                [field]: updatedList,
            });

            clear();
            toast.success(`${label} added`);
        } catch (error) {
            console.error(`Failed to update ${field}:`, error);
            toast.error("Could not update preferences");
        }
    };

    const handleDelete = async (
        key: string,
        field: "exercise_types" | "scenario_types"
    ) => {
        const currentList = preferences?.[field] || [];
        const updatedList = currentList.filter(
            (item: string) => item.toLowerCase().replace(/\s+/g, "-") !== key
        );

        try {
            await api.patch(`/preferences/${field}`, {
                value: updatedList,
            });

            setPreferences({
                ...preferences!,
                [field]: updatedList,
            });

            toast.success("Preference deleted");
        } catch (error) {
            console.error(`Failed to delete from ${field}:`, error);
            toast.error("Could not delete preference");
        }
    };

    const renderTable = (
        label: string,
        data: string[],
        field: "exercise_types" | "scenario_types"
    ) => (
        <Table
            rowKey={(record) => record.toLowerCase().replace(/\s+/g, "-")}
            size="middle"
            bordered
            scroll={{ y: 240 }}
            dataSource={data}
            columns={[
                {
                    title: label,
                    dataIndex: "name",
                    key: "name",
                    width: "85%",
                    render: (_, record) => <span>{record}</span>,
                },
                {
                    title: "Action",
                    key: "action",
                    align: "right",
                    width: "15%",
                    render: (_, record) => (
                        <Popconfirm
                            title={`Delete "${record}"?`}
                            okText="Yes"
                            cancelText="No"
                            onConfirm={() =>
                                handleDelete(record.toLowerCase().replace(/\s+/g, "-"), field)
                            }
                        >
                            <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                danger
                                size="small"
                            />
                        </Popconfirm>
                    ),
                },
            ]}
        />
    );


    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ flex: "0 0 auto" }}>
                <PageHeader
                    title="System Settings"
                    subtitle="Manage types and upload procedures"
                />
            </div>

            <div style={{ flex: "1 1 auto", overflowY: "auto", padding: 24 }}>
                <Space direction="vertical" style={{ width: "100%" }} size="large">
                    {/* Exercise Types */}
                    <Card title="Exercise Types">
                        <Space.Compact style={{ marginBottom: 12 }}>
                            <Input
                                placeholder="Add new exercise type"
                                value={newExerciseType}
                                onChange={(e) => setNewExerciseType(e.target.value)}
                                onPressEnter={() =>
                                    handleAdd(
                                        "Exercise Type",
                                        newExerciseType,
                                        "exercise_types",
                                        () => setNewExerciseType("")
                                    )
                                }
                            />

                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() =>
                                    handleAdd(
                                        "Exercise Type",
                                        newExerciseType,
                                        "exercise_types",
                                        () => setNewExerciseType("")
                                    )
                                }
                            >
                                Add
                            </Button>
                        </Space.Compact>
                        {renderTable("Exercise Type", preferences?.exercise_types || [], "exercise_types")}
                    </Card>

                    {/* Scenario Types */}
                    <Card title="Scenario Types">
                        <Space.Compact style={{ marginBottom: 12 }}>
                            <Input
                                placeholder="Add new scenario type"
                                value={newScenarioType}
                                onChange={(e) => setNewScenarioType(e.target.value)}
                                onPressEnter={() =>
                                    handleAdd(
                                        "Scenario Type",
                                        newScenarioType,
                                        "scenario_types",
                                        () => setNewScenarioType("")
                                    )
                                }
                            />

                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() =>
                                    handleAdd(
                                        "Scenario Type",
                                        newScenarioType,
                                        "scenario_types",
                                        () => setNewScenarioType("")
                                    )
                                }
                            >
                                Add
                            </Button>
                        </Space.Compact>
                        {renderTable("Scenario Type", preferences?.scenario_types || [], "scenario_types")}
                    </Card>

                </Space>
            </div>
        </div>
    );
}
