import { Modal, Input, Select, Button, Typography, message } from "antd";
import { PlayCircleFilled, PauseCircleFilled, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import type { Speaker } from "../../../../../../types/index.types";
import { v4 as uuidv4 } from 'uuid';
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../../../../../contexts/AuthProvider";

export default function AudioEditorModal({
  visible,
  onClose,
  speakers,
  setSpeakers,
  voices,
}: {
  visible: boolean;
  onClose: () => void;
  speakers: Speaker[];
  setSpeakers: (speakers: Speaker[]) => void;
  voices: { label: string; name: string; gender: string }[];
}) {
  const [localSpeakers, setLocalSpeakers] = useState<Speaker[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

    const { token } = useContext(AuthContext);

  useEffect(() => {
    if (visible) {
      setLocalSpeakers([...speakers]); // clone current
    }
  }, [visible]);

  const handlePlay = (speaker: Speaker) => {
    if (!speaker.voice) return message.warning("No voice selected");
    const audio = new Audio(`http://localhost:5000/data/audio/${speaker.voice}.mp3?token=${token}`);
    if (audioRef.current) audioRef.current.pause();
    audioRef.current = audio;
    audio.play();
    setPlayingId(speaker.id);
    audio.onended = () => setPlayingId(null);
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingId(null);
    }
  };

  const handleSave = () => {
    const valid = localSpeakers.every((s) => s.name.trim() && s.voice);
    if (!valid) return message.error("All speakers must have name and voice.");
    setSpeakers(localSpeakers);
    onClose();
  };

  const handleAdd = () => {
    setLocalSpeakers([...localSpeakers, { id: uuidv4(), name: "", voice: undefined }]);
  };

  const handleRemove = (id: string) => {
    if (localSpeakers.length <= 2) return; // minimum 2
    setLocalSpeakers(localSpeakers.filter((s) => s.id !== id));
  };

  return (
    <Modal
      title="Edit Audio Profiles"
      open={visible}
      onCancel={onClose}
      onOk={handleSave}
      okText="Save"
      cancelText="Cancel"
    >
      {localSpeakers.map((speaker, index) => (
        <div key={speaker.id} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <Input
            placeholder="Speaker Name"
            value={speaker.name}
            onChange={(e) =>
              setLocalSpeakers((prev) =>
                prev.map((s) => (s.id === speaker.id ? { ...s, name: e.target.value } : s))
              )
            }
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Voice"
            value={speaker.voice}
            onChange={(val) =>
              setLocalSpeakers((prev) =>
                prev.map((s) => (s.id === speaker.id ? { ...s, voice: val } : s))
              )
            }
            style={{ flex: 2 }}
          >
            {voices.map((v) => (
              <Select.Option key={v.name} value={v.name}>
                {v.label} - {v.gender}
              </Select.Option>
            ))}
          </Select>
          <Button
            shape="circle"
            icon={
              playingId === speaker.id ? (
                <PauseCircleFilled />
              ) : (
                <PlayCircleFilled />
              )
            }
            onClick={() =>
              playingId === speaker.id ? handlePause() : handlePlay(speaker)
            }
          />
         {index > 1 && (
             <Button
            shape="circle"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleRemove(speaker.id)}
          />)}
        </div>
      ))}
      <Button type="dashed" onClick={handleAdd} block icon={<PlusOutlined />}>
        Add New Speaker
      </Button>
    </Modal>
  );
}


