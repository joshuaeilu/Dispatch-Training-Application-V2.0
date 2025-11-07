import { useEffect, useState, useRef} from "react";
import { getDefaultMOP } from "../../contexts/UniversalHelpers";
import PdfViewer from "../Shared/PdfViewer";
import { getToken } from "../../contexts/AuthProvider";
import { Card } from "antd";

export default function ViewMop(){
    const [defaultMOP, setDefaultMOP] = useState<string | null>(null);


  // Refs for page and scroll container
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
    const token = getToken();

    useEffect(() => {
        const fetchDefaultMOP = async () => {
            try {
                const response = await getDefaultMOP();
                setDefaultMOP(response.data.filename);
            } catch (error) {
                console.error("Error fetching default MOP:", error);
            }
        };
        fetchDefaultMOP();
    }, []);
    
    return (
                    <PdfViewer
                    fileUrl={`http://localhost:5000/data/mop/${defaultMOP}?token=${token}`}
                    highlights={[]}
                    scrollContainerRef={scrollContainerRef}
                    pageRefs={pageRefs}
                />
            
    )
}