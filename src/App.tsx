
import { useEffect, useRef, useState } from "react";
import {
  createCampusGame,
  type CampusGame,
  type CameraMode,
  type MissionId,
} from "./game/CampusScene";
import { GameHUD, type DialogueInfo } from "./components/GameHUD";
import { MobileControls } from "./components/MobileControls";
import "./App.css";

const dailyMissions: { id: MissionId; title: string; detail: string }[] = [
  { id: "talk-to-student", title: "Meet a student", detail: "Find someone in the courtyard" },
  { id: "visit-computer-lab", title: "Visit the Computer Lab", detail: "Main Building · Floor 1 or 2" },
  { id: "attend-class", title: "Attend a class", detail: "Enter a classroom" },
  { id: "sit-in-auditorium", title: "Take a seat", detail: "Find a seat in the auditorium" },
];

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<CampusGame | null>(null);

  const [camera, setCamera] = useState<CameraMode>("third");
  const [floor, setFloor] = useState(1);
  const [interactionPrompt, setInteractionPrompt] = useState<string | null>(null);
  const [dialogue, setDialogue] = useState<DialogueInfo | null>(null);
  const [completedMissions, setCompletedMissions] = useState<Record<MissionId, boolean>>({
    "talk-to-student": false,
    "visit-computer-lab": false,
    "attend-class": false,
    "sit-in-auditorium": false,
  });
  const [gameMinutes, setGameMinutes] = useState(8 * 60);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function startGame() {
      if (!canvasRef.current) return;

      try {
        const game = await createCampusGame(canvasRef.current, {
          onFloorChange: setFloor,
          onInteractionPrompt: setInteractionPrompt,
          onDialogueChange: setDialogue,
          onMissionComplete: mission => {
            setCompletedMissions(previous => ({ ...previous, [mission]: true }));
          },
        });

        if (cancelled) {
          game.dispose();
          return;
        }

        gameRef.current = game;
        setLoading(false);
      } catch (error) {
        console.error("Game initialization failed:", error);
      }
    }

    startGame();

    return () => {
      cancelled = true;
      gameRef.current?.dispose();
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setGameMinutes(minutes => (minutes + 5) % (24 * 60));
    }, 10000);
    return () => window.clearInterval(timer);
  }, []);

  function changeCamera() {
    const next = camera === "third" ? "first" : "third";

    setCamera(next);
    gameRef.current?.setCameraMode(next);
  }

  function hold(key: string) {
    gameRef.current?.keys.add(key);
  }

  function release(key: string) {
    gameRef.current?.keys.delete(key);
  }

  const currentTime = `${String(Math.floor(gameMinutes / 60)).padStart(2, "0")}:${String(gameMinutes % 60).padStart(2, "0")}`;

  return (
    <main className="game">
      <canvas
        ref={canvasRef}
        className="game-canvas"
      />

      {loading && (
        <div className="loading">
          Loading UCS Meiktila Campus...
        </div>
      )}

      <GameHUD
        floor={floor}
        currentTime={currentTime}
        missions={dailyMissions}
        completedMissions={completedMissions}
        interactionPrompt={interactionPrompt}
        dialogue={dialogue}
        onCloseDialogue={() => setDialogue(null)}
      />

      <button
        className="camera-button"
        onClick={changeCamera}
      >
        {camera === "third"
          ? "First Person"
          : "Third Person"}
      </button>

      <MobileControls onHold={hold} onRelease={release} />

      <div className="game-hint">
        WASD: Move · Shift: Run · Mouse: Camera
      </div>
    </main>
  );
}
