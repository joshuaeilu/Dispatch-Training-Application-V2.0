import { useContext, useEffect, useState } from "react";
import { AUDIENCE_STYLES } from "../../../../../data/data";
import type { ProgressTableType, TableColumnDef } from "../../../../../types/index.types";
import { PageBreadcrumbs } from "../../../../Shared/Breadcrumbs";
import { PageHeader } from "../../../../Shared/PageHeader";
import { TableViewer } from "../../../../Shared/TableViewer";
import { ArrowRightOutlined } from "@ant-design/icons";
import { UniversalContext } from "../../../../../contexts/UniversalHelpers";
import { getAudienceTotal } from "../../../../../utils/tools";
import dayjs from "dayjs";
import { api } from "../../../../../utils/api";
import AssignmentDrawer from "./AssignmentDrawer";



export default function ScenarioProgress() {
    const [progressData, setProgressData] = useState<ProgressTableType[]>([]);
    const { users } = useContext(UniversalContext);
    
    const [openDrawer, setOpenDrawer] = useState(false);
    const [drawerData, setDrawerData] = useState<any>(null);

    useEffect(() => {
        if (!users || users.length === 0) return;

        async function ScenarioProgressData() {
            const response = await api.get("/scenarios/progress");

            const progressData: ProgressTableType[] = response.data.map((item: any) => ({
                id: item.id,
                name: item.name,
                audience: item.audience,
                completedAssignments: item.attempt_count,
                totalAssignments: getAudienceTotal(users, item.audience),
                completionPercentage: item.completion_percentage,
                completedUsers: item.attempts,
                createdOn: dayjs(item.created_at).format("MMM D, YYYY"),
            }));

            setProgressData(progressData);
        }

        ScenarioProgressData();
    }, [users]);







    const ScenarioProgressColumn: TableColumnDef<ProgressTableType>[] = [
        {
            key: "name",
            header: "Name",
            render: (row: any) => <span>{row.name}</span>,
            align: "text-left",
            searchable: true,
            filterable: false,
        },
        {
            key: 'audience',
            header: 'Audience',
            align: 'text-left',
            render: (row: ProgressTableType) => <span
                className={`
                inline-flex items-center
                rounded-md
                px-2.5 py-0.5
                text-xs font-medium
                ring-1 ring-inset
                ${AUDIENCE_STYLES[row.audience as keyof typeof AUDIENCE_STYLES]}
              `}>{row.audience}</span>,
            searchable: true,
            filterable: true,
        },
        {
            key: "completedAssignments",
            header: "Completed",
            render: (row: any) => <span>{row.completedAssignments} / {row.totalAssignments}</span>,
            align: "text-center",
            searchable: false,
            filterable: false,
        },

        {
            key: "completionPercentage",
            header: "Completion Rate %",
            render: (row: any) => <span>{(row.completedAssignments / row.totalAssignments * 100)}%</span>,
            align: "text-center",
            searchable: false,
            filterable: false,
        },
        {
            key: "createdOn",
            header: "Created On",
            render: (row: any) => <span>{row.createdOn}</span>,
            align: "text-center",
            searchable: false,
            filterable: false,
        },
        {
            header: "View Details",
            align: "text-center",
            render: (row: any) => (
                <div className="pt-1 flex justify-center">
                    <div
                        className="flex h-8 w-8 items-center justify-center  rounded-full transition-all cursor-pointer duration-200 group-hover:translate-x-0.5"
                        style={{
                            backgroundColor: "rgba(140, 33, 49, 0.08)",
                        }}
                         onClick={() => {
                            setOpenDrawer(true);
                            setDrawerData(row);
                        }}
                    >
                        <ArrowRightOutlined
                            className="text-[12px] transition-colors duration-200"
                            style={{
                                color: "#8C2131",
                            }}
                        />
                    </div>
                </div>
            ),
            searchable: false,
            filterable: false,
        },
    ];


    return (
        <>
            <PageHeader title="Scenario Progress" subtitle="Monitor participation and completion across all scenarios" />
            <PageBreadcrumbs items={[{ name: "Scenario Progress", current: true }]} />
            <TableViewer columnDefinitions={ScenarioProgressColumn} columnData={progressData} />
            
            <AssignmentDrawer open={openDrawer} setOpen={setOpenDrawer} drawerData={drawerData} kind="scenario" />

        </>
    )
}