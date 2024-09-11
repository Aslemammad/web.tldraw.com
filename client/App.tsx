import { useSync } from "@tldraw/sync";
import { Tldraw } from "tldraw";
import { getBookmarkPreview } from "./getBookmarkPreview";
import { multiplayerAssetStore } from "./multiplayerAssetStore";

// Where is our worker located? Configure this in `vite.config.ts`
const WORKER_URL = process.env.TLDRAW_WORKER_URL;

// In this example, the room ID is hard-coded. You can set this however you like though.
const roomId = "test-room";

// const uri = "wss://tldraw-multiplayer.tldraw.workers.dev/r/5QbuDAFZusEyj8gSpV2Ww?sessionId=TLDRAW_INSTANCE_STATE_V1_3Evvx81cBSbjbEss-pjpv&storeId=xe8lXYBpM90km6Vhkt1sQ"

function App() {
  const isReadonly = !location.search.includes("?write");
  // Create a store connected to multiplayer.
  const store = useSync({
    // We need to know the websockets URI...
    uri: `${WORKER_URL}/connect/${roomId}`,
    // uri: uri,
    // ...and how to handle static assets like images & videos
    assets: multiplayerAssetStore,
  });

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw
        hideUi={isReadonly}
        // we can pass the connected store into the Tldraw component which will handle
        // loading states & enable multiplayer UX like cursors & a presence menu
        store={store}
        initialState={isReadonly ? "hand" : "select"}
        onMount={(editor) => {
          for (const page of editor.getPages()) {
            const normalizedPathname = normalizePath(location.pathname);
            const normalizedPageName = normalizePath(page.name);

            if (normalizedPathname === normalizedPageName) {
              editor.setCurrentPage(page);
              break;
            }
          }

          // when the editor is ready, we need to register our bookmark unfurling service
          editor.registerExternalAssetHandler("url", getBookmarkPreview);
          editor.updateInstanceState({
            isReadonly,
          });
        }}
      />
    </div>
  );
}

export default App;

function normalizePath(path: string) {
  return path.endsWith("/") ? path.slice(0, -1) : path;
}
