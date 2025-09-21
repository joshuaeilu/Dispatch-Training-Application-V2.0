import { Card, Typography, Radio, Space, Tag, Popconfirm, Dropdown, Menu, Button } from "antd";
import type { Scenario, Scene, SceneEditorProps } from "../../../../types/index.types";
import { DeleteOutlined, MoreOutlined, UserOutlined } from "@ant-design/icons";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

interface SceneOverviewProps{
  scenario: Scenario;
  setScenario: React.Dispatch<React.SetStateAction<Scenario>>;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}

// Reorder utility
function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [moved] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, moved);
  return result;
}



export default function SceneOverview({
  scenario,
  setScenario,
  currentIndex,
  setCurrentIndex,
}: SceneOverviewProps) {
  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination || source.index === destination.index) return;

    const updatedScenes = reorder(scenario.scenes, source.index, destination.index);
    setScenario({ ...scenario, scenes: updatedScenes });
    setCurrentIndex(destination.index);
  };

const handleDeleteScene = (indexToDelete: number) => {
  setScenario((prevScenario) => {
    const updatedScenes = [...prevScenario.scenes];
    if (indexToDelete < 0 || indexToDelete >= updatedScenes.length) {
      console.warn("Invalid scene index to delete:", indexToDelete);
      return prevScenario;
    }

    updatedScenes.splice(indexToDelete, 1);

    // Adjust currentIndex if necessary
    let newCurrentIndex = currentIndex;

    if (currentIndex === indexToDelete) {
      // Deleted the currently selected card
      newCurrentIndex = Math.max(0, indexToDelete - 1);
    } else if (currentIndex > indexToDelete) {
      // Shift currentIndex back by 1 if item before it was removed
      newCurrentIndex = currentIndex - 1;
    }

    // If no scenes left, reset to 0
    if (updatedScenes.length === 0) {
      newCurrentIndex = 0;
    }

    setCurrentIndex(newCurrentIndex);

    return {
      ...prevScenario,
      scenes: updatedScenes,
    };
  });
};

  
  return (
    <div
      style={{
        width: "30%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        paddingRight: 8,
      }}
    >
      <Typography.Title
        level={5}
        style={{
          padding: "8px 12px",
          margin: 0,
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        Scenario Overview
      </Typography.Title>
  <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="scene-list">
          {(dropProvided) => (
            <div
              ref={dropProvided.innerRef}
              {...dropProvided.droppableProps}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "12px",
                backgroundColor: "#fff",
              }}
            >
              {scenario.scenes.map((scene, index) => {
                const isCurrent = index === currentIndex;
                const draggableId = (scene as any).id || `scene-${index}`;

                return (
                  <Draggable draggableId={draggableId} index={index} key={draggableId}>
                    {(dragProvided, dragSnapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        style={{
                          ...dragProvided.draggableProps.style,
                          marginBottom: 12,
                          boxShadow: dragSnapshot.isDragging
                            ? "0 6px 16px rgba(0,0,0,0.12)"
                            : "0 1px 4px rgba(0,0,0,0.05)",
                          borderRadius: 12,
                        }}
                        onClick={() => setCurrentIndex(index)}
                      >
            <Card
              key={index}
              size="small"
              onClick={() => setCurrentIndex?.(index)}
          title={
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Left: Scene Label */}
      <Typography.Text
        strong
        style={{
          fontSize: 13,
          backgroundColor: "#f0f0f0",
          padding: "2px 8px",
          borderRadius: 6,
        }}
      >
        Scene {index + 1}
      </Typography.Text>

      {/* Right: Speaker + Delete */}


<Space size="small" align="center">
  <UserOutlined style={{ color: "#8C2131", fontSize: 16 }} />
  <Typography.Text type="secondary" style={{ fontSize: 13 }}>
    {scene.speaker}
  </Typography.Text>

  {/* Options Dropdown */}
{scenario.scenes.length > 1 && (  <Dropdown
    overlay={
      <Menu>
        <Menu.Item key="delete" >
          <Popconfirm
            title="Are you sure you want to delete this scene?"
            okText="Delete"
            okType="danger"
            cancelText="Cancel"
            icon={<DeleteOutlined style={{ color: "red" }} />}
            
            onConfirm={() => handleDeleteScene(index)} // 🛠️ implement this
          >
<Button
  type="text"
  danger
  size="small"
  style={{
    padding: "4px 10px",
    borderRadius: 6,
    fontWeight: 500,
    color: "#C2002F",              // Calvin red
    background: "transparent",     // no bg
    boxShadow: "none",
  }}

>
  Delete Scene
</Button>

          </Popconfirm>
        </Menu.Item>
      </Menu>
    }
    trigger={['click']}
    placement="bottomRight"
  >
<Button
  type="default"
  color="default"
  size="small"
  icon={<MoreOutlined />}
  variant="filled"
  

/>


  </Dropdown>)}
</Space>

    </div>
  }

              style={{
                marginBottom: 16,
                border: isCurrent
                  ? "2px solid #8C2131"
                  : "1px solid rgba(0, 0, 0, 0.08)",
                borderRadius: 10,
                boxShadow: isCurrent
                  ? "0 2px 8px rgba(48,106,255,0.15)"
                  : "0 1px 3px rgba(0,0,0,0.06)",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              {/* Scene Description */}
              {scene.sceneDescription && (      <> <Typography.Text strong style={{ display: "block", marginBottom: 4 }}>
                Description:
              </Typography.Text>
              <Typography.Paragraph
                type="secondary"
                style={{
                  marginBottom: 8,
                  fontSize: 14,
                  color: "#595959", // improved from AntD default
                  lineHeight: 1.5,
                }}              >
                {scene.sceneDescription}
              </Typography.Paragraph> </>)}

              {/* Higlights Selected */}
             {/* Highlights Section */}
{scene.highlights.length > 0 && (
 <>
 <Typography.Text strong style={{ display: "block", marginBottom: 4 }}>
                    Highlights:
                  </Typography.Text>
                  <Space size={[6, 6]} wrap>
                    {scene.highlights.map((highlight, idx) => (
                      <Tag
                        key={idx}
                        color="gold"
                        style={{
                          fontSize: 12,
                          padding: "2px 6px",
                          borderRadius: 6,
                        }}
                      >
                        {highlight.name}
                      </Tag>
                    ))}
                  </Space>
 </>
)}


              {/* Options with correct answer highlight */}
              {scene.options.length > 0 && (
                <>
                  <Typography.Text strong style={{ display: "block", marginBottom: 4 }}>
                    Options:
                  </Typography.Text>
                  <Radio.Group value={scene.correctOption} disabled style={{ width: "100%" }}>
                    <Space direction="vertical" style={{ width: "100%" }}>
                      {scene.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          style={{
                            border:
                              scene.correctOption === option
                                ? "2px solid #52c41a"
                                : "1px solid #f0f0f0",
                            padding: "4px 8px",
                            borderRadius: 6,
                            backgroundColor:
                              scene.correctOption === option ? "#f6ffed" : "#fafafa",
                          }}
                        >
                          <Radio value={option}>{option}</Radio>
                        </div>
                      ))}
                    </Space>
                  </Radio.Group>
                </>
              )}

              {/* Tip */}
              {scene.tip && (
                <div
                  style={{
                    marginTop: 12,
                    backgroundColor: "#e6f4ff",
                    padding: "8px 12px",
                    borderRadius: 8,
                  }}
                >
                  <Typography.Text strong style={{ color: "#1677ff" }}>
                    Tip:
                  </Typography.Text>
                  <Typography.Paragraph style={{ marginBottom: 0, fontSize: 13 }}>
                    {scene.tip}
                  </Typography.Paragraph>
                </div>
              )}
            </Card>
          </div>
                    )}
                  </Draggable>
                );
              })}
              {dropProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
