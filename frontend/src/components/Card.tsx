import { useEffect, useRef, useState } from "react";
import { ShareIcon } from "../icons/shareIcon";
import { TwitterIcon } from "../icons/Twitter";
import { YoutubeIcon } from "../icons/YoutubeIcon";
import { DeleteIcons } from "../icons/DeleteIcons";

export type ContentType = 'twitter' | 'youtube' | 'image' | 'video' | 'audio' | 'pdf' | 'link';

interface CardProps {
  title: string;
  link: string;
  type: ContentType;
  onDelete?: () => Promise<void> | void;
  onEdit?: () => Promise<void> | void;
  onToggleShare?: () => Promise<void> | void;
  showDelete?: boolean;
  showEdit?: boolean;
  showShare?: boolean;
  id: string;
  className?: string;
}

declare global {
  interface Window {
    twttr?: any;
  }
}

let twitterScriptPromise: Promise<void> | null = null;
const loadTwitterScript = (): Promise<void> => {
  if (twitterScriptPromise) {
    return twitterScriptPromise;
  }
  twitterScriptPromise = new Promise((resolve) => {
    if (window.twttr?.widgets) {
      return resolve();
    }
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
  return twitterScriptPromise;
};


export function Card({ title, link, type, onDelete, className }: CardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const contentContainerRef = useRef<HTMLDivElement>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    setShowDeleteConfirm(false);
    try {
      await onDelete();
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const extractYouTubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return url.match(regex)?.[1] || null;
  };

  const extractTweetId = (url: string): string | null => {
    const regex = /\/status\/(\d+)/;
    return url.match(regex)?.[1] || null;
  };

  const youTubeId = type === "youtube" ? extractYouTubeId(link) : null;

  useEffect(() => {
    const container = contentContainerRef.current;
    if (!container) return;

    const tweetId = extractTweetId(link);

    // --- Cleanup and Exit Conditions ---
    // If the card is not a tweet or has no valid ID, clear the container and exit.
    if (type !== "twitter" || !tweetId) {
      container.innerHTML = "";
      // Clean up our tracking attributes
      delete container.dataset.renderedTweetId;
      delete container.dataset.renderingTweetId;
      return;
    }

    // --- Idempotency Check (The Fix) ---
    // 1. If this exact tweet is already fully rendered, do nothing.
    // 2. If this exact tweet is currently being rendered, do nothing.
    if (
      container.dataset.renderedTweetId === tweetId ||
      container.dataset.renderingTweetId === tweetId
    ) {
      return;
    }

    // --- Start Rendering Process ---
    // Set the "rendering in progress" flag SYNCHRONOUSLY to prevent race conditions.
    container.dataset.renderingTweetId = tweetId;
    // The previously rendered tweet (if any) is now invalid.
    delete container.dataset.renderedTweetId;

    container.innerHTML = '<p class="text-sm text-gray-500 p-4">Loading tweet...</p>';

    loadTwitterScript().then(() => {
      // Ensure the component is still mounted and this is the tweet we want.
      if (container.dataset.renderingTweetId === tweetId) {
        container.innerHTML = ""; // Clear loading message

        window.twttr.widgets.createTweet(tweetId, container, {
          theme: "light",
          dnt: true,
        }).then((element: HTMLElement | undefined) => {
          // Check if the container still exists and we are still the active render task
          if (container.dataset.renderingTweetId === tweetId) {
            if (element) {
              // On success, mark as "rendered"
              container.dataset.renderedTweetId = tweetId;
            } else {
              container.innerHTML = '<p class="text-sm text-red-500 p-4">Tweet not found or could not be loaded.</p>';
            }
            // Clear the "in-progress" flag after completion.
            delete container.dataset.renderingTweetId;
          }
        });
      }
    });
  }, [type, link]);

  return (
    <div className={`relative group ${className}`}>
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all duration-300 transform group-hover:shadow-lg group-hover:-translate-y-1">
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center min-w-0 pr-2">
              <div className="p-2 bg-purple-100 rounded-lg mr-3 flex-shrink-0">
                {type === "youtube" ? (
                  <YoutubeIcon className="w-5 h-5 text-red-600" />
                ) : (
                  <TwitterIcon className="w-5 h-5 text-blue-400" />
                )}
              </div>
              <h3 className="font-medium text-gray-800 truncate">{title}</h3>
            </div>

            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
               {/* Action Buttons */}
               <button onClick={handleCopyLink} className="p-1.5 text-gray-500 hover:text-purple-600 rounded-full hover:bg-purple-50" title="Copy link">
                <ShareIcon className="w-4 h-4" />
               </button>
               <a href={link} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-500 hover:text-purple-600 rounded-full hover:bg-purple-50" title="Open in new tab">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
               </a>
               {onDelete && (
                <button onClick={handleDelete} disabled={isDeleting} className="p-1.5 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 disabled:opacity-50" title="Delete">
                  {isDeleting ? (<svg className="animate-spin h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>) : (<DeleteIcons className="w-4 h-4" />)}
                </button>
               )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-lg bg-gray-50 min-h-[200px] flex items-center justify-center">
            {type === "youtube" ? (
              youTubeId ? (
                <div className="aspect-w-16 aspect-h-9 w-full">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${youTubeId}`}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <p className="text-sm text-red-500 p-4">Invalid YouTube URL.</p>
              )
            ) : (
              <div
                ref={contentContainerRef}
                className="w-full max-w-[500px] mx-auto flex justify-center"
              />
            )}
          </div>
        </div>
      </div>

      {isCopied && (
        <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full animate-bounce">
          Copied!
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Item</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}