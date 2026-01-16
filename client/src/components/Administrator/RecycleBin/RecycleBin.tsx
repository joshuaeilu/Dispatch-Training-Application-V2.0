import { useEffect, useState } from "react";
import { PageHeader } from "../../Shared/PageHeader";
import { TableViewer } from "../../Shared/TableViewer";
import { api } from "../../../utils/api";
import type { TableColumnDef } from "../../../types/index.types";
import dayjs from "dayjs";
import { getUsers } from "../../../contexts/UniversalHelpers";
import ArrowPathIcon from "@heroicons/react/20/solid/ArrowPathIcon";
import TrashIcon from "@heroicons/react/20/solid/TrashIcon";
import { Popconfirm } from "antd";
import { toTitleCase } from "../../../utils/tools";


interface RecycleBinItemType {
    id: string;
    item_name: string;
    item_id: string;
    type: string;
    deleted_at: string;
    deleted_by_id: string;
}

type RecycleItemType = "resource" | "scenario" | "exercise";

const TYPE_BADGE_META: Record<
  RecycleItemType,
  { label: string; className: string }
> = {
  resource: {
    label: "Resource",
    className: "bg-blue-50 text-blue-700 ring-blue-600/20",
  },
  scenario: {
    label: "Scenario",
    className: "bg-purple-50 text-purple-700 ring-purple-600/20",
  },
  exercise: {
    label: "Knowledge Check",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  },
};


export default function RecycleBin() {
    const [recycleBinItems, setRecycleBinItems] = useState<RecycleBinItemType[]>([]);
    const [loading, setLoading] = useState(true);
    const { users } = getUsers();

    useEffect(() => {
        // Fetch recycle bin items from the API
        async function fetchRecycleBinItems() {
            // API call to fetch items
            try {
                const { data } = await api.get('/trash');
                // Process and set the data to state
                setRecycleBinItems(
                    data.map((item: any) => ({
                        id: item.id,
                        item_name: item.item_name,
                        item_id: item.trash_item_id,
                        type: item.item_type,
                        deleted_at: item.deleted_at,
                        deleted_by_id: item.who_deleted,
                    }))
                );
            } catch (error) {
                console.error("❌ Failed to fetch recycle bin items:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchRecycleBinItems();
    }, []);

    const handleRestore = async (item: RecycleBinItemType) => {
        try {
            await api.put(`/trash/${item.id}/restore`);
            // Refresh the list
            setRecycleBinItems(prev => prev.filter(i => i.id !== item.id));
        } catch (error) {
            console.error("❌ Failed to restore item:", error);
        }
    };

    const handlePermanentDelete = async (item: RecycleBinItemType) => {
        try {
            await api.delete(`/trash/${item.id}`);
            // Refresh the list
            setRecycleBinItems(prev => prev.filter(i => i.id !== item.id));
        } catch (error) {
            console.error("❌ Failed to permanently delete item:", error);
        }
    };

    const recycleBinColumns: TableColumnDef<RecycleBinItemType>[] = [
        {
            key: "item_name",
            header: "Name",
            render: (item: RecycleBinItemType) => item.item_name,
        },
       {
  key: "type",
  header: "Type",
  render: (item: RecycleBinItemType) => {
    const meta = TYPE_BADGE_META[item.type as RecycleItemType];

    if (!meta) return null;

    return (
      <span
        className={`
          inline-flex items-center
          rounded-md
          px-2.5 py-0.5
          text-xs font-medium
          ring-1 ring-inset
          ${meta.className}
        `}
      >
        {meta.label}
      </span>
    );
  },
}
,
        {
            key: "deleted_by_id",
            header: "Deleted By",
            render: (item: RecycleBinItemType) => {
                const user = users.find(u => u.id === item.deleted_by_id);
                return user ? toTitleCase(user.name ): 'Unknown';
            },
        },
        {
            key: "deleted_at",
            header: "Deleted At",
render: (item: RecycleBinItemType) =>
  dayjs(item.deleted_at).format("MMM D, YYYY • h:mm A"),


        },
        {
            header: "Actions",
            render: (item: RecycleBinItemType) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleRestore(item)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-green-50 px-2.5 py-1.5 text-sm text-green-700 hover:bg-green-100"
                    >
                        <ArrowPathIcon className="size-4" />
                        Restore
                    </button>
                    <Popconfirm
                        title="Permanently delete this item?"
                        description="This action cannot be undone."
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handlePermanentDelete(item)}
                    >
                        <button
                            className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1.5 text-sm text-red-700 hover:bg-red-100"
                        >
                            <TrashIcon className="size-4" />
                            Delete
                        </button>
                    </Popconfirm>
                </div>
            ),
        }]


        return(
            <>
              <PageHeader title="Recycle Bin" subtitle="Items here can be restored or permanently deleted." />
                    <TableViewer tableType="Recycable Item" loading={loading} columnDefinitions={recycleBinColumns} columnData={recycleBinItems} />
        </>
        
    );
}