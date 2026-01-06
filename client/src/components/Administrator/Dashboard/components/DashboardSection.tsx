import { Col, Row } from "antd";
import { Typography } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;



export default function DashboardSection({
    title,
    subtitle,
    cardsData,
}: {
    title: string;
    subtitle: string;
    cardsData: {
        title: string;
        description: string;
        icon: React.ReactNode;
        route: string;
    }[];
}) {
    const navigate = useNavigate();
    return (
        <>
            <div className=" px-6 py-5 sm:px-6">
                <h3 className="text-xl font-semibold text-brand-maroon">{title}</h3>
                <p className="mt-1 text-sm text-gray-500">
                    {subtitle}
                </p>
            </div>

            <div className="px-6">
                <Row gutter={[24, 24]}>
                    {cardsData.map((card, index) => (
                        <Col key={index} xs={24} sm={12} md={8} >
                            <div className="group cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl" onClick={() => navigate(card.route)}>
                                <div className="px-4 py-5 sm:p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Left: icon + text */}
                                        <div className="flex items-start gap-4">
                                            <div
                                                className="shrink-0"
                                                style={{
                                                    backgroundColor: "rgba(140, 33, 49, 0.08)",
                                                    width: 44,
                                                    height: 44,
                                                    borderRadius: 8,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    fontSize: 24,
                                                    justifyContent: "center",
                                                    color: "#8C2131",
                                                }}
                                            >
                                                {card.icon}
                                            </div>

                                            <div className="min-w-0 pt-0.5">
                                                <Title level={5} style={{ margin: 0, fontWeight: 600 }}>
                                                    {card.title}
                                                </Title>

                                                <Paragraph
                                                    style={{
                                                        margin: 0,
                                                        marginTop: 6,
                                                        fontSize: 14,
                                                        lineHeight: "20px",
                                                        color: "#555",
                                                    }}
                                                >
                                                    {card.description}
                                                </Paragraph>
                                            </div>
                                        </div>


                                        <div className="pt-1">
                                            <div
                                                className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 group-hover:translate-x-0.5"
                                                style={{
                                                    backgroundColor: "rgba(140, 33, 49, 0.08)",
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


                                    </div>
                                </div>
                            </div>

                        </Col>
                    ))}
                </Row>
            </div>
        </>
    );
}