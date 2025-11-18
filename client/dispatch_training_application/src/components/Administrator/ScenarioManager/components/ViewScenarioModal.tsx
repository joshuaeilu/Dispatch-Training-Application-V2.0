import { Modal, Card, Typography, Radio, Space, Tag, Divider } from "antd";
import type { Scenario, ScenarioTableType } from "../../../../types/index.types";
import { UserOutlined, CheckCircleFilled, InfoCircleOutlined } from "@ant-design/icons";

const { Text, Paragraph } = Typography;

interface ViewScenarioModalProps {
  open: boolean;
  onClose: () => void;
  scenario: ScenarioTableType | undefined;
}

export default function ViewScenarioModal({
  open,
  onClose,
  scenario,
}: ViewScenarioModalProps) {
  if (!scenario) return null;

  return (
    <Modal
      title={
        <div style={{
          color: 'var(--color-primary)',
          fontSize: '20px',
          fontWeight: 600,
          letterSpacing: '-0.2px'
        }}>
          {scenario.name + " Scenario"}
        </div>
      }
      open={open}
      onCancel={onClose}
      width={850}
      footer={null}
      style={{ top: 20 }}
      styles={{
        body: { padding: '16px 8px' }
      }}
    >
      <div style={{
        overflowY: 'auto',
        maxHeight: '80vh',
        padding: '0 16px',
      }}>

        {/* Scenes */}
        {scenario.scenes.map((scene, index) => (
          <Card
            key={index}
            style={{
              marginBottom: '20px',
              borderRadius: '12px',
              border: '1px solid #e8e8e8',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
            styles={{
              header: {
                borderBottom: '1px solid #f0f0f0',
                padding: '12px 20px',
                background: 'linear-gradient(to bottom, #fafafa, #ffffff)'
              },
              body: { padding: '20px' }
            }}
            title={
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#262626'
                  }}>
                    Scene {index + 1}
                  </span>
                </div>
                
                {/* Speaker */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 12px',
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0'
                }}>
                  <UserOutlined style={{ color: '#8C2131', fontSize: '14px' }} />
                  <Text style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#595959'
                  }}>
                    {scene.speaker}
                  </Text>
                </div>
              </div>
            }
          >
            {/* Scene Description */}
            {scene.sceneDescription && (
              <div style={{ marginBottom: '20px' }}>
                <Text style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#8c8c8c',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Description
                </Text>
                <Paragraph style={{
                  fontSize: '15px',
                  lineHeight: '1.6',
                  color: '#262626',
                  marginBottom: 0
                }}>
                  {scene.sceneDescription}
                </Paragraph>
              </div>
            )}

            {/* Options */}
            {scene.options.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
             <Text style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#8c8c8c',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Options
                </Text>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {scene.options.map((option, optIndex) => {
                    const isCorrect = scene.correctOption === option;
                    const letter = String.fromCharCode(65 + optIndex);

                    return (
                      <div
                        key={optIndex}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: isCorrect ? '2px solid #52c41a' : '1px solid #e8e8e8',
                          backgroundColor: isCorrect ? '#f6ffed' : '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Radio
                          checked={isCorrect}
                          disabled
                          style={{ pointerEvents: 'none' }}
                        />
                        <span style={{
                          fontWeight: isCorrect ? 500 : 400,
                          color: isCorrect ? '#262626' : '#595959',
                          fontSize: '14px',
                          flex: 1
                        }}>
                          <span style={{ fontWeight: 600, marginRight: '8px' }}>
                            {letter}.
                          </span>
                          {option}
                        </span>
                        {isCorrect && (
                          <CheckCircleFilled style={{
                            color: '#52c41a',
                            fontSize: '16px'
                          }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tip */}
            {scene.tip && (
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                backgroundColor: '#e6f7ff',
                borderLeft: '4px solid #1890ff',
                borderRadius: '8px'
              }}>
                <div style={{
                  fontWeight: 600,
                  color: '#096dd9',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <InfoCircleOutlined />
                  Tip
                </div>
                <Text style={{
                  fontSize: '13px',
                  color: '#0050b3',
                  lineHeight: '1.5'
                }}>
                  {scene.tip}
                </Text>
              </div>
            )}
          </Card>
        ))}
      </div>
    </Modal>
  );
}