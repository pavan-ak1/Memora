// Extend the Window interface to include the Twitter widget types
declare global {
  interface Window {
    twttr?: {
      widgets: {
        createTweet: (tweetId: string, element: HTMLElement, options?: any) => Promise<void>;
        // Add other widget methods if needed
      };
      // Add other Twitter widget API methods if needed
    };
  }
}

export {}; // This file needs to be a module
