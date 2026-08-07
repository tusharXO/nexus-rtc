/// <reference types="vite/client" />
interface Window {
    electronAPI: {
        getScreenSources: () => Promise<Array<{ id: string; name: string; thumbnail: string }>>;
    };
}