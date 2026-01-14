import { Collapse, Empty, Row, Col, Skeleton, Tag } from "antd";

const { Panel } = Collapse;

type Section<T> = {
  date: string;
  items: T[];
};

type ProgressSectionProps<T> = {
  loading: boolean;
  sections: Section<T>[];
  emptyText: string;
  renderItem: (item: T) => React.ReactNode;
};

export default function ProgressSection<T>({
  loading,
  sections,
  emptyText,
  renderItem,
}: ProgressSectionProps<T>) {
  if (loading && sections.length === 0) {
    return (
      <Row gutter={[16, 16]}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Col xs={24} sm={12} md={8} lg={6} key={i}>
            <Skeleton active />
          </Col>
        ))}
      </Row>
    );
  }

  if (!loading && sections.length === 0) {
    return <Empty description={emptyText} />;
  }

  return (
    <Collapse bordered={false}>
      {sections.map((sec, i) => (
        <Panel
          key={i}
          header={
            <div className="flex justify-between">
              <span className="font-semibold text-brand-maroon">
                {sec.date}
              </span>
              <Tag color="red">{sec.items.length}</Tag>
            </div>
          }
        >
          <Row gutter={[16, 16]}>
            {sec.items.map(renderItem)}
          </Row>
        </Panel>
      ))}
    </Collapse>
  );
}
