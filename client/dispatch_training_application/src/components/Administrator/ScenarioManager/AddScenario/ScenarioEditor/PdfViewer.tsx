import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import MOP2025 from "../../../../../assets/MOP2025.pdf"
import { useEffect, useRef, useState } from 'react';
import { Button, Form, Input, Space, Spin, Tooltip, Typography } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { ZoomInOutlined, ZoomOutOutlined, ReloadOutlined, HighlightOutlined, SearchOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import type { PdfViewerProps, HighlightData } from '../../../../../types/index.types';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

export default function PdfViewer({ highlights, setHighlights, scrollContainerRef, pageRefs }: PdfViewerProps) {
    const [loading, setLoading] = useState(true);
    const [numPages, setNumPages] = useState(0);
    const [pagesRendered, setPagesRendered] = useState(0);
    const [zoom, setZoom] = useState(1.0);
    const [selectedHighlight, setSelectedHighlight] = useState<HighlightData | null>(null);
    const popupRef = useRef<HTMLDivElement | null>(null);
    const [showInput, setShowInput] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [matches, setMatches] = useState<HighlightData[]>([]);
    const [activeMatchIndex, setActiveMatchIndex] = useState(0);

    const { Title, Text } = Typography;

    const handleZoomIn = () => {
        setLoading(true);
        setPagesRendered(0);
        setZoom((z) => Math.min(z + 0.2, 3));
    };

    const handleZoomOut = () => {
        setLoading(true);
        setPagesRendered(0);
        setZoom((z) => Math.max(z - 0.2, 0.4));
    };

    // Track highlight selection
    useEffect(() => {
        const handleMouseUp = () => {
            const selection = window.getSelection()
            if (!selection || selection.isCollapsed) return

            const text = selection.toString().trim()
            if (!text) return

            const range = selection.getRangeAt(0)
            if (!range) return

            const rects = Array.from(range.getClientRects())
            if (rects.length === 0) return

            const anchorNode = selection.anchorNode
            if (!anchorNode || !(anchorNode instanceof Node)) return

            const pageContainer = anchorNode.parentElement?.closest('.react-pdf__Page') as HTMLElement | null
            if (!pageContainer) return

            const page = parseInt(pageContainer.getAttribute('data-page-number') || '', 10)
            if (isNaN(page)) return

            const containerRect = pageContainer.getBoundingClientRect()

            const normalizedRects = rects.map((r) => ({
                x: (r.left - containerRect.left) / containerRect.width,
                y: (r.top - containerRect.top) / containerRect.height,
                width: r.width / containerRect.width,
                height: r.height / containerRect.height,
            }));

            setSelectedHighlight({
                id: uuidv4(),
                text,
                name: '',
                page,
                containerIndex: -1,
                startOffset: range.startOffset,
                endOffset: range.endOffset,
                rects: normalizedRects,
            })
        }

        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    // Close highlight popup on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                setSelectedHighlight(null)
                setShowInput(false)
                window.getSelection()?.removeAllRanges()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const scrollToMatch = (index: number, matchArray = matches) => {
        const match = matchArray[index];
        if (!match) return;

        const pageEl = pageRefs.current[match.page - 1];
        if (pageEl && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: pageEl.offsetTop - 20,
                behavior: 'smooth'
            });
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setMatches([]);
            setActiveMatchIndex(0);
            return;
        }

        const results: HighlightData[] = [];
        const searchTerm = searchQuery.toLowerCase();

        try {
            const pdf = await pdfjs.getDocument(MOP2025).promise;

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const viewport = page.getViewport({ scale: 1 });

                // Combine all text items into a single string with position tracking
                let fullText = '';
                const textItems: any[] = [];

                textContent.items.forEach((item: any, index: number) => {
                    const itemStart = fullText.length;
                    fullText += item.str;
                    textItems.push({
                        ...item,
                        startIndex: itemStart,
                        endIndex: fullText.length,
                        itemIndex: index
                    });
                });

                // Find all occurrences of search term in the full text
                let searchIndex = 0;
                while ((searchIndex = fullText.toLowerCase().indexOf(searchTerm, searchIndex)) !== -1) {
                    const matchEnd = searchIndex + searchTerm.length;

                    // Find which text items contain this match
                    const startItem = textItems.find(item =>
                        searchIndex >= item.startIndex && searchIndex < item.endIndex
                    );
                    const endItem = textItems.find(item =>
                        matchEnd > item.startIndex && matchEnd <= item.endIndex
                    );

                    if (startItem && endItem) {
                        // Calculate bounding box for the match
                        const startItemIndex = textItems.indexOf(startItem);
                        const endItemIndex = textItems.indexOf(endItem);

                        // Get all items that are part of this match
                        const matchItems = textItems.slice(startItemIndex, endItemIndex + 1);

                        if (matchItems.length > 0) {
                            // Calculate combined bounding box
                            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

                            matchItems.forEach(item => {
                                const transform = item.transform;
                                const [scaleX, skewX, skewY, scaleY, translateX, translateY] = transform;

                                // Calculate item bounds
                                const itemWidth = item.width || (item.str.length * Math.abs(scaleX));
                                const itemHeight = Math.abs(scaleY);

                                const x = translateX;
                                const y = viewport.height - translateY - itemHeight; // Flip Y coordinate

                                minX = Math.min(minX, x);
                                minY = Math.min(minY, y);
                                maxX = Math.max(maxX, x + itemWidth);
                                maxY = Math.max(maxY, y + itemHeight);
                            });

                            // Normalize coordinates to page dimensions
                            const rect = {
                                x: minX / viewport.width,
                                y: minY / viewport.height,
                                width: (maxX - minX) / viewport.width,
                                height: (maxY - minY) / viewport.height,
                            };

                            results.push({
                                id: uuidv4(),
                                text: fullText.substring(searchIndex, matchEnd),
                                name: `Search: ${searchQuery}`,
                                page: pageNum,
                                containerIndex: -1,
                                startOffset: searchIndex,
                                endOffset: matchEnd,
                                rects: [rect]
                            });
                        }
                    }

                    searchIndex = matchEnd;
                }
            }

            setMatches(results);
            setActiveMatchIndex(0);
            if (results.length > 0) {
                scrollToMatch(0, results);
            }
        } catch (error) {
            console.error('Search error:', error);
            setMatches([]);
        }
    };

    const handleNextMatch = () => {
        if (matches.length === 0) return;
        const next = (activeMatchIndex + 1) % matches.length;
        setActiveMatchIndex(next);
        scrollToMatch(next);
    };

    const handlePrevMatch = () => {
        if (matches.length === 0) return;
        const prev = (activeMatchIndex - 1 + matches.length) % matches.length;
        setActiveMatchIndex(prev);
        scrollToMatch(prev);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '35%', marginRight: 10, marginLeft: 10 }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0px 12px 8px 1px",
                    backgroundColor: "var(--color-bg-base)",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                }}
            >
      

                <Space>
                    <Input.Search
                        placeholder="Search PDF"
                        allowClear
                        value={searchQuery}
                        onChange={(e) => {
                            const val = e.target.value;
                            setSearchQuery(val);

                            // remove highlights when cleared
                            if (val.trim() === "") {
                                setMatches([]);
                                setActiveMatchIndex(0);
                            }
                        }}
                        onSearch={(value) => {
                            // Only search if there's actually a search term
                            if (value && value.trim()) {
                                handleSearch();
                            }
                        }}
                        style={{ width: 200 }}
                        enterButton={<SearchOutlined />}
                    />


                    {matches.length > 0 && (
                        <>
                            <Button icon={<ArrowLeftOutlined />} onClick={handlePrevMatch} />
                            <Text>{activeMatchIndex + 1} / {matches.length}</Text>
                            <Button icon={<ArrowRightOutlined />} onClick={handleNextMatch} />
                        </>
                    )}
                </Space>

                <Space align="center" size="middle">
                    <Text strong style={{ width: 60, textAlign: "right" }}>
                        {Math.round(zoom * 100)}%
                    </Text>

                    <Tooltip title="Zoom Out">
                        <Button
                            shape="circle"
                            icon={<ZoomOutOutlined />}
                            onClick={handleZoomOut}
                            disabled={loading}
                        />
                    </Tooltip>

                    <Tooltip title="Zoom In">
                        <Button
                            shape="circle"
                            icon={<ZoomInOutlined />}
                            onClick={handleZoomIn}
                            disabled={loading}
                        />
                    </Tooltip>

                    <Tooltip title="Reset Zoom">
                        <Button
                            shape="circle"
                            icon={<ReloadOutlined />}
                            onClick={() => {
                                setZoom(1.0);
                                setPagesRendered(0);
                                setLoading(true);
                            }}
                            disabled={loading}
                        />
                    </Tooltip>
                </Space>
            </div>

            <div
                style={{
                    height: '100%',
                    overflow: 'auto',
                    position: 'relative',
                }}
            >
                {loading && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: 100,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backdropFilter: 'blur(6px)',
                            backgroundColor: 'rgba(255, 255, 255, 0.6)',
                        }}
                    >
                        <Spin size="large" tip="Loading PDF..." />
                    </div>
                )}

                <div
                    ref={scrollContainerRef}
                    style={{
                        width: '100%',
                        height: '100%',
                        overflow: 'auto',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Document scale={zoom}
                        file={MOP2025}
                        onLoadSuccess={({ numPages }) => {
                            setNumPages(numPages);
                        }}
                    >
                        {Array.from({ length: numPages }, (_, index) => (
                            <div
                                key={`page_${index + 1}`}
                                id={`pdf-page-${index + 1}`}
                                ref={(el) => { (pageRefs.current[index] = el) }}
                                style={{ marginBottom: '1rem', position: 'relative' }}
                            >
                                <Page
                                    key={`page_${index + 1}`}
                                    pageNumber={index + 1}
                                    onRenderSuccess={() => {
                                        setPagesRendered((prev) => {
                                            const next = prev + 1;
                                            if (next === numPages) {
                                                setTimeout(() => setLoading(false), 1500);
                                            }
                                            return next;
                                        });
                                    }}
                                />

                                {/* Render manual highlights */}
                                {highlights
                                    .filter((h) => h.page === index + 1)
                                    .flatMap((h, hi) => {
                                        const pageWidth = pageRefs.current[index]?.offsetWidth ?? 0;
                                        const pageHeight = pageRefs.current[index]?.offsetHeight ?? 0;

                                        return h.rects.map((rect, ri) => (
                                            <div
                                                key={`highlight-${hi}-${ri}`}
                                                style={{
                                                    position: 'absolute',
                                                    left: rect.x * pageWidth,
                                                    top: rect.y * pageHeight,
                                                    width: rect.width * pageWidth,
                                                    height: rect.height * pageHeight,
                                                    backgroundColor: 'yellow',
                                                    mixBlendMode: 'multiply',
                                                    borderRadius: 2,
                                                    pointerEvents: 'none',
                                                }}
                                            />
                                        ));
                                    })}

                                {/* Render search matches */}
                                {matches
                                    .filter(m => m.page === index + 1)
                                    .flatMap((m, mi) => {
                                        const pageWidth = pageRefs.current[index]?.offsetWidth ?? 0;
                                        const pageHeight = pageRefs.current[index]?.offsetHeight ?? 0;
                                        const isActive = matches[activeMatchIndex]?.id === m.id;

                                        return m.rects.map((rect, ri) => (
                                            <div
                                                key={`match-${mi}-${ri}`}
                                                style={{
                                                    position: 'absolute',
                                                    left: rect.x * pageWidth,
                                                    top: rect.y * pageHeight,
                                                    width: rect.width * pageWidth,
                                                    height: rect.height * pageHeight,
                                                    backgroundColor: isActive ? '#ff6b6b' : '#a2d683',
                                                    opacity: 0.6,
                                                    borderRadius: 2,
                                                    pointerEvents: 'none',
                                                    border: isActive ? '2px solid #d63031' : '1px solid #00b894',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        ));
                                    })}

                                {/* Show highlight name input */}
                                {selectedHighlight?.page === index + 1 && (
                                    <div
                                        ref={popupRef}
                                        style={{
                                            position: 'absolute',
                                            top: selectedHighlight.rects[0].y * (pageRefs.current[index]?.offsetHeight ?? 0) - 8,
                                            left: selectedHighlight.rects[0].x * (pageRefs.current[index]?.offsetWidth ?? 0),
                                            transform: `scale(${1 / zoom})`,
                                            transformOrigin: 'top left',
                                            backgroundColor: '#fff',
                                            border: '1px solid #ccc',
                                            padding: '4px 8px',
                                            zIndex: 1000,
                                            borderRadius: '4px',
                                        }}
                                    >
                                        {showInput ? (
                                            <Form
                                                layout="inline"
                                                onFinish={({ highlightName }) => {
                                                    const name = highlightName.trim();
                                                    if (!name) return;

                                                    setHighlights([...highlights, { ...selectedHighlight, name }]);
                                                    setSelectedHighlight(null);
                                                    setShowInput(false);
                                                    window.getSelection()?.removeAllRanges();
                                                }}
                                            >
                                                <Form.Item
                                                    name="highlightName"
                                                    rules={[{ required: true, message: "Please enter a name" }]}
                                                >
                                                    <Input
                                                        placeholder="Name highlight"
                                                        size="small"
                                                        autoFocus
                                                        style={{ minWidth: 140 }}
                                                    />
                                                </Form.Item>

                                                <Form.Item>
                                                    <Button
                                                        type="primary"
                                                        htmlType="submit"
                                                        size="small"
                                                    >
                                                        Save
                                                    </Button>
                                                </Form.Item>
                                            </Form>
                                        ) : (
                                            <Button
                                                type="primary"
                                                icon={<HighlightOutlined />}
                                                size="middle"
                                                onClick={() => setShowInput(true)}
                                                style={{ borderRadius: 6 }}
                                            >
                                                Highlight
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </Document>
                </div>
            </div>
        </div>
    )
}