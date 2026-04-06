import React, { useState, useEffect } from "react";

const normalizeGammaUrlForEmbed = (url) => {
  if (!url || typeof url !== "string") return url;
  // Convert gamma.app URLs to embed format
  if (url.includes("gamma.app")) {
    // Handle gamma.app/public/ID or gamma.app/docs/ID -> gamma.app/embed/ID
    return url
      .replace(/gamma\.app\/public\//i, "gamma.app/embed/")
      .replace(/gamma\.app\/docs\//i, "gamma.app/embed/");
  }
  return url;
};

const TextStreamPlayer = ({ moduleId, url, onComplete }) => {
  const [fetchedHtml, setFetchedHtml] = useState(null);
  const [loadingHtml, setLoadingHtml] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setFetchedHtml(null);
    setLoadingHtml(false);
    setError(null);
  }, [url]);

  // No URL
  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-slate-400 bg-slate-900 border-2 border-dashed border-slate-700 p-8 rounded-xl">
        <h3 className="text-xl font-bold mb-2">Text Stream Unavailable</h3>
        <p>The URL for this reading material is missing or invalid.</p>
      </div>
    );
  }

  // Error loading
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-red-400 bg-slate-900 border-2 border-red-500 border-dashed p-8 rounded-xl">
        <h3 className="text-xl font-bold mb-2">⚠️ Error Loading Document</h3>
        <p className="text-sm text-center max-w-sm">{error}</p>
      </div>
    );
  }

  // Loading (if we were fetching)
  if (loadingHtml) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-slate-400 bg-slate-900 border-2 border-dashed border-slate-700 p-8 rounded-xl">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Loading document...</p>
      </div>
    );
  }

  // Fetched local HTML file (if any)
  if (fetchedHtml !== null) {
    return (
      <div className="relative w-full h-full bg-white rounded-xl overflow-hidden shadow-2xl border border-slate-200">
        <iframe
          srcDoc={fetchedHtml}
          className="w-full h-full border-0 bg-white"
          title="Reading Material"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen; clipboard-read"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    );
  }

  // Embed code pasted directly (e.g. <iframe ...>)
  const isEmbedCode =
    url.trim().toLowerCase().startsWith("<iframe") ||
    url.trim().toLowerCase().startsWith("<div");

  if (isEmbedCode) {
    let embedHtml = url.trim();
    if (embedHtml.toLowerCase().includes("<iframe")) {
      embedHtml = embedHtml.replace(
        /<iframe/i,
        `<iframe style="width: 100%; height: 100%; border: none;" allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation allow-top-navigation allow-top-navigation-by-user-activation" `
      );
    }
    return (
      <div
        className="relative w-full h-full bg-white rounded-xl overflow-hidden shadow-2xl flex items-center justify-center [&>iframe]:w-full [&>iframe]:h-full"
        dangerouslySetInnerHTML={{ __html: embedHtml }}
      />
    );
  }

  // Direct loading: HTML files, PDFs, gamma presentations, etc.
  const normalizedUrl = normalizeGammaUrlForEmbed(url);
  return (
    <div className="relative w-full h-full bg-white rounded-xl overflow-hidden shadow-2xl border border-slate-200">
      <iframe
        src={normalizedUrl}
        className="w-full h-full border-0 bg-white"
        title="Reading Material"
        allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation allow-top-navigation allow-top-navigation-by-user-activation"
      />
    </div>
  );
};

export default TextStreamPlayer;