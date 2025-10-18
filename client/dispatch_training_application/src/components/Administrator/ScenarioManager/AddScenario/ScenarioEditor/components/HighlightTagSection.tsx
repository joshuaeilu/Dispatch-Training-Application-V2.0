import { Tag,} from 'antd';
import type {  HighlightTagListProps } from '../../../../../../types/index.types';



const HighlightTagList: React.FC<HighlightTagListProps> = ({
  highlights,
  setHighlights,
  scrollToHighlight,
}) => {

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', margin: '8px 0', gap: '8px', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
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