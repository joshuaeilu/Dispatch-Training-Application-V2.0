import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react';
import { Button, Input, Space, Spin, Tooltip, Typography } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  HighlightOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import type { PdfViewerProps, HighlightData } from '../../types/index.types';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const ZOOM_STEP = 0.2;
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 3;
const DEBOUNCE_DELAY = 300;
const PRELOAD_PAGES = 2;

// Memoized Page Overlay Component
const PageOverlay = memo(({ 
  pageIndex, 
  highlights, 
  matches, 
  activeMatchIndex, 
  pageWidth, 
  pageHeight 
}: {
  pageIndex: number;
  highlights: HighlightData[];
  matches: HighlightData[];
  activeMatchIndex: number;
  pageWidth: number;
  pageHeight: number;
}) => {
  const pageHighlights = useMemo(
    () => highlights.filter((h) => h.page === pageIndex + 1),
    [highlights, pageIndex]
  );

  const pageMatches = useMemo(
    () => matches.filter((m) => m.page === pageIndex + 1),
    [matches, pageIndex]
  );

  return (
    <>
      {/* Highlights */}
      {pageHighlights.flatMap((h, hi) =>
        h.rects.map((rect, ri) => (
          <div
            key={`highlight-${h.id}-${ri}`}
            style={{
              position: 'absolute',
              left: rect.x * pageWidth,
              top: rect.y * pageHeight,
              width: rect.width * pageWidth,
              height: rect.height * pageHeight,
              backgroundColor: 'rgba(255, 235, 59, 0.4)',
              mixBlendMode: 'multiply',
              borderRadius: 2,
              pointerEvents: 'none',
            }}
          />
        ))
      )}

      {/* Search Matches */}
      {pageMatches.flatMap((m, mi) => {
        const isActive = matches[activeMatchIndex]?.id === m.id;
        return m.rects.map((rect, ri) => (
          <div
            key={`match-${m.id}-${ri}`}
            style={{
              position: 'absolute',
              left: rect.x * pageWidth,
              top: rect.y * pageHeight,
              width: rect.width * pageWidth,
              height: rect.height * pageHeight,
              backgroundColor: isActive ? 'rgba(255, 87, 34, 0.5)' : 'rgba(76, 175, 80, 0.4)',
              borderRadius: 2,
              pointerEvents: 'none',
              border: isActive ? '2px solid #ff5722' : '1px solid #4caf50',
              boxSizing: 'border-box',
              transition: 'all 0.2s ease',
            }}
          />
        ));
      })}
    </>
  );
}, (prev, next) => {
  return (
    prev.pageIndex === next.pageIndex &&
    prev.highlights === next.highlights &&
    prev.matches === next.matches &&
    prev.activeMatchIndex === next.activeMatchIndex &&
    prev.pageWidth === next.pageWidth &&
    prev.pageHeight === next.pageHeight
  );
});

PageOverlay.displayName = 'PageOverlay';

export default function PdfViewer({
  fileUrl,
  highlights = [],
  setHighlights,
  scrollContainerRef,
  pageRefs,
}: PdfViewerProps) {
  const { Text } = Typography;

  // State management
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(0);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());
  const [allPagesLoaded, setAllPagesLoaded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [selectedHighlight, setSelectedHighlight] = useState<HighlightData | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [matches, setMatches] = useState<HighlightData[]>([]);
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set([1, 2, 3]));

  // Refs
  const popupRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pdfDocRef = useRef<any>(null);
  const textCacheRef = useRef<Map<number, any>>(new Map());
  const zoomTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Track page loading progress
  const handlePageLoadSuccess = useCallback((pageNum: number) => {
    setLoadedPages(prev => {
      const newSet = new Set(prev);
      newSet.add(pageNum);
      return newSet;
    });
  }, []);

  // Check if all pages are loaded
  useEffect(() => {
    if (numPages > 0 && loadedPages.size === numPages) {
      setAllPagesLoaded(true);
    }
  }, [loadedPages, numPages]);

  // Responsive zoom calculation
  const getInitialZoom = useCallback(() => {
    if (typeof window === 'undefined') return 1;
    const width = window.innerWidth;
    if (width < 640) return 0.5;
    if (width < 1024) return 0.7;
    return 1;
  }, []);

  // Initialize zoom based on screen size
  useEffect(() => {
    setZoom(getInitialZoom());

    const handleResize = () => {
      if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);
      zoomTimeoutRef.current = setTimeout(() => {
        setZoom(getInitialZoom());
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);
    };
  }, [getInitialZoom]);

  // Aggressive page preloading - load all pages immediately
  useEffect(() => {
    if (numPages > 0) {
      // Load all pages immediately for fastest rendering
      const allPages = new Set<number>();
      for (let i = 1; i <= numPages; i++) {
        allPages.add(i);
      }
      setVisiblePages(allPages);
    }
  }, [numPages]);

  // Intersection Observer for tracking which pages are in viewport
  useEffect(() => {
    if (!scrollContainerRef?.current || numPages === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const pageNum = parseInt(entry.target.getAttribute('data-page-number') || '0');
          
          if (entry.isIntersecting) {
            // Ensure nearby pages are loaded
            const newVisiblePages = new Set(visiblePages);
            for (let i = Math.max(1, pageNum - PRELOAD_PAGES); i <= Math.min(numPages, pageNum + PRELOAD_PAGES); i++) {
              newVisiblePages.add(i);
            }
            if (newVisiblePages.size !== visiblePages.size) {
              setVisiblePages(newVisiblePages);
            }
          }
        });
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '500px',
        threshold: 0.01,
      }
    );

    const pageElements = scrollContainerRef.current.querySelectorAll('[data-page-number]');
    pageElements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [numPages, scrollContainerRef, visiblePages]);

  // Fullscreen handling
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Debounced zoom handlers
  const handleZoomIn = useCallback(() => {
    if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);
    zoomTimeoutRef.current = setTimeout(() => {
      setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM));
    }, 50);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);
    zoomTimeoutRef.current = setTimeout(() => {
      setZoom((z) => Math.max(z - ZOOM_STEP, MIN_ZOOM));
    }, 50);
  }, []);

  // Optimized text selection for highlights
  const handleTextSelection = useCallback(() => {
    if (!setHighlights) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const text = selection.toString().trim();
    if (!text) return;

    const range = selection.getRangeAt(0);
    if (!range) return;

    const rects = Array.from(range.getClientRects());
    if (rects.length === 0) return;

    const anchorNode = selection.anchorNode;
    if (!anchorNode || !(anchorNode instanceof Node)) return;

    const pageContainer = anchorNode.parentElement?.closest('.react-pdf__Page') as HTMLElement | null;
    if (!pageContainer) return;

    const page = parseInt(pageContainer.getAttribute('data-page-number') || '', 10);
    if (isNaN(page)) return;

    const containerRect = pageContainer.getBoundingClientRect();

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
    });
  }, [setHighlights]);

  useEffect(() => {
    if (!setHighlights) return;
    document.addEventListener('mouseup', handleTextSelection);
    return () => document.removeEventListener('mouseup', handleTextSelection);
  }, [handleTextSelection, setHighlights]);

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setSelectedHighlight(null);
        setShowInput(false);
        window.getSelection()?.removeAllRanges();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll to match with smooth behavior
  const scrollToMatch = useCallback(
    (index: number, matchArray = matches) => {
      const match = matchArray[index];
      if (!match || !pageRefs?.current || !scrollContainerRef?.current) return;

      const pageEl = pageRefs.current[match.page - 1];
      if (pageEl) {
        scrollContainerRef.current.scrollTo({
          top: pageEl.offsetTop - 20,
          behavior: 'smooth',
        });
      }
    },
    [matches, pageRefs, scrollContainerRef]
  );

  // Optimized search with caching and lazy loading
  const searchInPage = useCallback(async (pageNum: number, searchTerm: string, pdf: any) => {
    const results: HighlightData[] = [];
    
    try {
      let textContent = textCacheRef.current.get(pageNum);
      let viewport;

      if (!textContent) {
        const page = await pdf.getPage(pageNum);
        textContent = await page.getTextContent();
        viewport = page.getViewport({ scale: 1 });
        
        textCacheRef.current.set(pageNum, { textContent, viewport });
      } else {
        viewport = textContent.viewport;
        textContent = textContent.textContent;
      }

      let fullText = '';
      const textItems: any[] = [];

      textContent.items.forEach((item: any) => {
        const itemStart = fullText.length;
        fullText += item.str;
        textItems.push({
          ...item,
          startIndex: itemStart,
          endIndex: fullText.length,
        });
      });

      let searchIndex = 0;
      while ((searchIndex = fullText.toLowerCase().indexOf(searchTerm, searchIndex)) !== -1) {
        const matchEnd = searchIndex + searchTerm.length;

        const startItem = textItems.find(
          (item) => searchIndex >= item.startIndex && searchIndex < item.endIndex
        );
        const endItem = textItems.find(
          (item) => matchEnd > item.startIndex && matchEnd <= item.endIndex
        );

        if (startItem && endItem) {
          const startItemIndex = textItems.indexOf(startItem);
          const endItemIndex = textItems.indexOf(endItem);
          const matchItems = textItems.slice(startItemIndex, endItemIndex + 1);

          if (matchItems.length > 0) {
            let minX = Infinity,
              minY = Infinity,
              maxX = -Infinity,
              maxY = -Infinity;

            matchItems.forEach((item) => {
              const transform = item.transform;
              const [scaleX, , , scaleY, translateX, translateY] = transform;

              const itemWidth = item.width || item.str.length * Math.abs(scaleX);
              const itemHeight = Math.abs(scaleY);

              const x = translateX;
              const y = viewport.height - translateY - itemHeight;

              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x + itemWidth);
              maxY = Math.max(maxY, y + itemHeight);
            });

            const rect = {
              x: minX / viewport.width,
              y: minY / viewport.height,
              width: (maxX - minX) / viewport.width,
              height: (maxY - minY) / viewport.height,
            };

            results.push({
              id: uuidv4(),
              text: fullText.substring(searchIndex, matchEnd),
              name: `Search: ${searchTerm}`,
              page: pageNum,
              containerIndex: -1,
              startOffset: searchIndex,
              endOffset: matchEnd,
              rects: [rect],
            });
          }
        }

        searchIndex = matchEnd;
      }
    } catch (error) {
      console.error(`Search error on page ${pageNum}:`, error);
    }

    return results;
  }, []);

  const handleSearch = useCallback(async () => {
    if (!allPagesLoaded) {
      return; // Don't search if pages aren't loaded
    }

    if (!searchQuery.trim()) {
      setMatches([]);
      setActiveMatchIndex(0);
      return;
    }

    setIsSearching(true);
    const searchTerm = searchQuery.toLowerCase();
    const allResults: HighlightData[] = [];

    try {
      const pdf = pdfDocRef.current || (await pdfjs.getDocument(fileUrl).promise);
      if (!pdfDocRef.current) pdfDocRef.current = pdf;

      const BATCH_SIZE = 5;
      for (let i = 1; i <= pdf.numPages; i += BATCH_SIZE) {
        const batch = [];
        for (let j = i; j < Math.min(i + BATCH_SIZE, pdf.numPages + 1); j++) {
          batch.push(searchInPage(j, searchTerm, pdf));
        }
        
        const batchResults = await Promise.all(batch);
        allResults.push(...batchResults.flat());
        
        if (allResults.length > 0) {
          setMatches([...allResults]);
        }
      }

      setMatches(allResults);
      setActiveMatchIndex(0);
      if (allResults.length > 0) {
        scrollToMatch(0, allResults);
      }
    } catch (error) {
      console.error('Search error:', error);
      setMatches([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, fileUrl, scrollToMatch, searchInPage, allPagesLoaded]);

  // Debounced search
  const handleSearchInput = useCallback(
    (value: string) => {
      setSearchQuery(value);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (!value.trim()) {
        setMatches([]);
        setActiveMatchIndex(0);
        return;
      }

      if (!allPagesLoaded) {
        return; // Don't search if pages aren't loaded
      }

      searchTimeoutRef.current = setTimeout(() => {
        handleSearch();
      }, DEBOUNCE_DELAY);
    },
    [handleSearch, allPagesLoaded]
  );

  const handleNextMatch = useCallback(() => {
    if (matches.length === 0) return;
    const next = (activeMatchIndex + 1) % matches.length;
    setActiveMatchIndex(next);
    scrollToMatch(next);
  }, [matches.length, activeMatchIndex, scrollToMatch]);

  const handlePrevMatch = useCallback(() => {
    if (matches.length === 0) return;
    const prev = (activeMatchIndex - 1 + matches.length) % matches.length;
    setActiveMatchIndex(prev);
    scrollToMatch(prev);
  }, [matches.length, activeMatchIndex, scrollToMatch]);

  // Save highlight handler
  const saveHighlight = useCallback(
    (name: string) => {
      if (!name || !selectedHighlight || !setHighlights) return;

      setHighlights([...highlights, { ...selectedHighlight, name }]);
      setSelectedHighlight(null);
      setShowInput(false);
      window.getSelection()?.removeAllRanges();
    },
    [selectedHighlight, highlights, setHighlights]
  );

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
        borderRadius: isFullscreen ? 0 : 8,
        overflow: 'hidden',
        boxShadow: isFullscreen ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#fff',
          padding: '12px 16px',
          borderBottom: '1px solid #e0e0e0',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Input.Search
            placeholder={allPagesLoaded ? "Search in PDF" : "Loading pages..."}
            allowClear
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            onSearch={handleSearch}
            style={{ width: '300px', maxWidth: '100%' }}
            enterButton={<SearchOutlined />}
            disabled={!allPagesLoaded}
          />
          
          {!allPagesLoaded && (
            <Tooltip title={`Loading pages: ${loadedPages.size} / ${numPages}`}>
              <Spin 
                indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} 
                size="small"
              />
            </Tooltip>
          )}
          
          {isSearching && (
            <Spin 
              indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} 
              size="small"
            />
          )}
        </div>

        {matches.length > 0 && (
          <Space align="center" size="small">
            <Button icon={<ArrowLeftOutlined />} onClick={handlePrevMatch} size="small" />
            <Text style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
              {activeMatchIndex + 1} / {matches.length}
            </Text>
            <Button icon={<ArrowRightOutlined />} onClick={handleNextMatch} size="small" />
          </Space>
        )}

        <Space align="center" size="small">
          <Tooltip title="Zoom Out">
            <Button shape="circle" icon={<ZoomOutOutlined />} onClick={handleZoomOut} size="small" />
          </Tooltip>

          <Text style={{ fontSize: '13px', minWidth: '50px', textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </Text>

          <Tooltip title="Zoom In">
            <Button shape="circle" icon={<ZoomInOutlined />} onClick={handleZoomIn} size="small" />
          </Tooltip>

          <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
            <Button
              shape="circle"
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={toggleFullscreen}
              size="small"
            />
          </Tooltip>
        </Space>
      </div>

      {/* PDF Content */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#e0e0e0' }}>
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
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px 10px',
          }}
        >
          <Document
            file={fileUrl}
            onLoadSuccess={({ numPages }) => {
              setNumPages(numPages);
              setLoading(false);
            }}
            loading={null}
          >
            {Array.from({ length: numPages }, (_, index) => {
              const pageNum = index + 1;
              const shouldRender = visiblePages.has(pageNum);

              return (
                <div
                  key={`page_${pageNum}`}
                  id={`pdf-page-${pageNum}`}
                  data-page-number={pageNum}
                  ref={(el) => {
                    if (pageRefs?.current) {
                      pageRefs.current[index] = el;
                    }
                  }}
                  style={{
                    marginBottom: '20px',
                    position: 'relative',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    backgroundColor: '#fff',
                    minHeight: shouldRender ? 'auto' : '800px',
                  }}
                >
                  {shouldRender ? (
                    <>
                      <Page
                        pageNumber={pageNum}
                        scale={zoom}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        loading={null}
                        onLoadSuccess={() => handlePageLoadSuccess(pageNum)}
                      />

                      <PageOverlay
                        pageIndex={index}
                        highlights={highlights}
                        matches={matches}
                        activeMatchIndex={activeMatchIndex}
                        pageWidth={pageRefs?.current?.[index]?.offsetWidth ?? 0}
                        pageHeight={pageRefs?.current?.[index]?.offsetHeight ?? 0}
                      />

                      {/* Highlight popup */}
                      {setHighlights && selectedHighlight?.page === pageNum && (
                        <div
                          ref={popupRef}
                          style={{
                            position: 'absolute',
                            top: selectedHighlight.rects[0].y * (pageRefs?.current?.[index]?.offsetHeight ?? 0) - 50,
                            left: selectedHighlight.rects[0].x * (pageRefs?.current?.[index]?.offsetWidth ?? 0),
                            backgroundColor: '#fff',
                            border: '1px solid #d9d9d9',
                            padding: '8px',
                            zIndex: 1000,
                            borderRadius: '4px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          }}
                        >
                          {showInput ? (
                            <Space>
                              <Input
                                placeholder="Name highlight"
                                size="small"
                                autoFocus
                                style={{ width: 150 }}
                                onPressEnter={(e) => saveHighlight((e.target as HTMLInputElement).value.trim())}
                              />
                              <Button
                                type="primary"
                                size="small"
                                onClick={() => {
                                  const input = document.querySelector(
                                    'input[placeholder="Name highlight"]'
                                  ) as HTMLInputElement;
                                  saveHighlight(input?.value.trim() || '');
                                }}
                              >
                                Save
                              </Button>
                            </Space>
                          ) : (
                            <Button
                              type="primary"
                              icon={<HighlightOutlined />}
                              size="small"
                              onClick={() => setShowInput(true)}
                            >
                              Highlight
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '800px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999',
                      }}
                    >
                      Page {pageNum}
                    </div>
                  )}
                </div>
              );
            })}
          </Document>
        </div>
      </div>
    </div>
  );
}