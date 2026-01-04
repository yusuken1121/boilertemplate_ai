"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
});

interface MermaidChartProps {
  code: string;
}

export default function MermaidChart({ code }: MermaidChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState("");

  useEffect(() => {
    if (code && ref.current) {
      const render = async () => {
        try {
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          // mermaid.render returns an object { svg: string } in newer versions, or just string in older.
          // We'll handle it carefully or assume v10+ which returns promise of { svg }
          const result = await mermaid.render(id, code);
          // Check if result is string or object (defensive)
          if (typeof result === "string") {
            setSvg(result);
          } else {
            setSvg(result.svg);
          }
        } catch (error) {
          console.error("Mermaid render error:", error);
          setSvg('<div class="text-red-500">Failed to render chart</div>');
        }
      };
      render();
    }
  }, [code]);

  return (
    <div
      ref={ref}
      dangerouslySetInnerHTML={{ __html: svg }}
      className="flex justify-center p-4 bg-white rounded-lg shadow-sm"
    />
  );
}
