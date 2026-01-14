import { useEffect, useState } from "react";
import { Switch } from "antd";
import { useNavigate } from "react-router-dom";
import { api } from "../../../utils/api";
import type { Exercise, ExerciseTableType, TableColumnDef } from "../../../types/index.types";
import ViewExerciseModal from "./AddExercise/ViewQuestions/components/ViewExerciseModal";
import { PageHeader } from "../../Shared/PageHeader";
import { DIFFICULTY_STYLES, STATUS_STYLES, AUDIENCE_STYLES } from "../../../data/data";
import { toTitleCase } from "../../../utils/tools";
import { getUser } from "../../../contexts/AuthProvider";
import { TableViewer } from "../../Shared/TableViewer";
import { TableActionButton } from "../../Shared/TableActionButton";
import ArrowTopRightOnSquareIcon from "@heroicons/react/20/solid/ArrowTopRightOnSquareIcon";
import PencilSquareIcon from "@heroicons/react/20/solid/PencilSquareIcon";
import TrashIcon from "@heroicons/react/20/solid/TrashIcon";
import { useToast } from "../../../contexts/ToastContext";
















export default function KnowledgeCheckViewExercises() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = getUser();
  const [exerciseFiles, setExerciseFiles] = useState<ExerciseTableType[]>([]);
  const [viewExerciseModal, setViewExerciseModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);





  const knowledgeCheckColumns: TableColumnDef<ExerciseTableType>[] = [
    {
      key: 'name',
      header: 'Name',
      align: 'text-left',
      render: (e: ExerciseTableType) => <span className="font-medium text-gray-900">{e.name}</span>,
      searchable: true,
      filterable: true,
    },
    {
      key: 'type',
      header: 'Type',
      align: 'text-left',
      render: (e: ExerciseTableType) => <span className="font-medium text-gray-900">{e.type}</span>,
      searchable: true,
      filterable: true,
    },
    {
      key: 'difficulty',
      header: 'Difficulty',
      align: 'text-left',
      render: (e: ExerciseTableType) => <span
        className={`
    inline-flex items-center
    rounded-md
    px-2.5 py-0.5
    text-xs font-medium
    ring-1 ring-inset
    ${DIFFICULTY_STYLES[e.difficulty]}
  `}
      >
        {e.difficulty}
      </span>,
      searchable: false,
      filterable: true,
    },
    {
      header: "Count",
      align: 'text-left',
      render: (e: ExerciseTableType) => (<span
        className="
          inline-flex items-center
          rounded-md
          bg-gray-50
          px-2.5 py-0.5
          text-xs font-medium
          text-gray-700
          ring-1 ring-inset ring-gray-600/20
        "
      >
        {e.questionCount}{" "}
        {e.questionCount === 1 ? "question" : "questions"}

      </span>),
      searchable: false,
      filterable: false
    },
    {
      key: 'status',
      header: 'Status',
      align: 'text-left',
      render: (e: ExerciseTableType) => <span
        className={`
    inline-flex items-center
    rounded-md
    px-2.5 py-0.5
    text-xs font-medium
    ring-1 ring-inset
    ${STATUS_STYLES[e.status]}
  `}>{toTitleCase(e.status)}</span>,
      filterable: false,
      searchable: false
    },
    {
      key: 'audience',
      header: 'Audience',
      align: 'text-left',
      render: (e: ExerciseTableType) => <span
        className={`
    inline-flex items-center
    rounded-md
    px-2.5 py-0.5
    text-xs font-medium
    ring-1 ring-inset
    ${AUDIENCE_STYLES[e.audience]}
  `}>{e.audience}</span>,
      searchable: true,
      filterable: true,
    },
    {
      key: 'visibility',
      header: 'Visibility',
      align: 'text-left',
      render: (e: ExerciseTableType) => <><Switch
        size="small"
        checked={e.visibility}
        onChange={async (checked) => {
          try {
            const response = await api.patch(`/exercises/${e.id}`, { visibility: checked });
            if (response.status === 200) {
              setExerciseFiles((prev) => prev.map((file) => file.id === e.id ? { ...file, visibility: checked } : file
              )
              );
                  toast.success("Visibility updated");
            }
          } catch (error) {
                toast.error("Failed to update visibility");
          }
        }} /><span>{e.visibility}</span></>
    },
    {
      header: 'Actions',
      align: 'text-center',
      render: (e: ExerciseTableType) => (
        <div className="flex justify-end gap-2">

          <TableActionButton
            icon={ArrowTopRightOnSquareIcon}
            title="View"
            color="green"
            onPress={() => {
              setSelectedExercise({
                id: e.id,
                name: e.name,
                type: e.type,
                difficulty: e.difficulty,
                questions: e.questions,
                audience: e.audience,
                createdBy: e.created_by.name,
                status: e.status,
                visibility: e.visibility,
              });
              setViewExerciseModal(true);
            }}
          />

          <TableActionButton
            icon={PencilSquareIcon}
            title="Edit"
            color="blue"
            onPress={() => {
              navigate(`/knowledge-checks/edit-exercise/`, {
                state: { exerciseId: e.id },
              });
            }}
          />
          <TableActionButton
            icon={TrashIcon}
            title="Delete"
            color="red"
            onPress={() => handleExerciseDelete(e.id)}
          />
        </div>
      )
    }];


  // Create a version of exerciseFiles that matches the TableType
  const exerciseData: ExerciseTableType[] = exerciseFiles.map(file => ({
    id: file.id,
    name: file.name,
    type: file.type,
    difficulty: file.difficulty,
    questionCount: file.questions.length,
    status: file.status,
    audience: file.audience,
    visibility: file.visibility,
    created_by: file.created_by,
    questions: file.questions,
  }));

  async function handleExerciseDelete(exerciseId: string) {
    try {
      await api.post('/trash', { trash_item_id: exerciseId, who_deleted: user?.id, item_type: 'exercise' });
      toast.success("Exercise moved to trash");
      setExerciseFiles((prev) =>
        prev.filter((file) => file.id !== exerciseId)
      );
    } catch (error) {
      toast.error("Failed to move exercise to trash");
    }
  }


  // Get all exercise data from the database
  useEffect(() => {
    async function init() {
      try {
        const { data } = await api.get("/exercises");
        setExerciseFiles(data);
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
      }

    }

    init(); // call the async function
  }, []);

  const allExerciseTypes = [
  ...Array.from(new Set(exerciseFiles.map(e => e.type).filter(Boolean)))
];


  const knowledgeCheckFilterOptions = {
    type: [ ...allExerciseTypes],
    status: ["draft", "published"],
    difficulty: ["Easy", "Medium", "Hard"],
    audience: ["All", "Trainees", "Dispatchers"],
  }



  return (
    <>
      <PageHeader
        title="View Exercises"
        subtitle="Filter, search and manage exercises"
      />
      <TableViewer tableType="Knowledge Check" columnDefinitions={knowledgeCheckColumns} columnData={exerciseData} filterOptions={knowledgeCheckFilterOptions} onButtonPress={() => navigate("/knowledge-checks/edit-exercise")} />
    
          {selectedExercise && (
            <ViewExerciseModal exercise={selectedExercise} setViewExerciseModal={setViewExerciseModal} viewExerciseModal={viewExerciseModal} />
          )}


        </>
  );
}