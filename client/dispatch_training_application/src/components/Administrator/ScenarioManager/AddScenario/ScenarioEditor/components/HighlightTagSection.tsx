import { Tag,} from 'antd';
import type {  HighlightTagListProps } from '../../../../../../types/index.types';



const HighlightTagList: React.FC<HighlightTagListProps> = ({
  highlights,
  setHighlights,
  scrollToHighlight,
}) => {

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '150px', overflowY: 'auto', padding: '8px 8px 16px 0px', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
      {highlights.map((highlight) => (
        <Tag
          key={highlight.id}
          color="gold"
          closable
          onClose={(e) => {
                e.preventDefault(); // prevent tag from disappearing automatically
                setHighlights(highlights.filter(h => h.id !== highlight.id));
              }}
              style={{ cursor: 'pointer' }}
              onClick={() => scrollToHighlight(highlight)}
            >
              {highlight.name}
            </Tag>
      ))}
    </div>
  );
};

export default HighlightTagList;