import { useState } from "react";
import type { MissionId } from "../game/CampusScene";

export interface DialogueInfo {
	speaker: string;
	text: string;
}

interface DailyMission {
	id: MissionId;
	title: string;
	detail: string;
}

interface GameHUDProps {
	floor: number;
	currentTime: string;
	missions: DailyMission[];
	completedMissions: Record<MissionId, boolean>;
	interactionPrompt: string | null;
	dialogue: DialogueInfo | null;
	onCloseDialogue: () => void;
}

const classSchedule = [
	{ start: "08:30", end: "10:00", title: "Programming Fundamentals", location: "Classroom · Floor 1" },
	{ start: "10:30", end: "12:00", title: "Computer Systems", location: "Computer Lab · Floor 1" },
	{ start: "13:00", end: "14:30", title: "Physics Laboratory", location: "Physics Lab · Floor 1" },
	{ start: "15:00", end: "16:00", title: "Project Meeting", location: "Auditorium" },
];

export function GameHUD({
	floor,
	currentTime,
	missions,
	completedMissions,
	interactionPrompt,
	dialogue,
	onCloseDialogue,
}: GameHUDProps) {
	const [activePanel, setActivePanel] = useState<"schedule" | "missions">("missions");
	const completedCount = missions.filter(mission => completedMissions[mission.id]).length;

	return (
		<>
			<header className="game-hud">
				<div>
					<h2>UCS MEIKTILA</h2>
					<span>University Life Simulator</span>
				</div>

				<div className="student-info">
					<span>MAIN BUILDING</span>
					<strong>Floor {floor} / 3</strong>
				</div>
			</header>

			<aside className="activity-panel" aria-label="University activities">
				<div className="activity-tabs" role="tablist" aria-label="Activities">
					<button
						type="button"
						role="tab"
						aria-selected={activePanel === "missions"}
						className={activePanel === "missions" ? "active" : ""}
						onClick={() => setActivePanel("missions")}
					>
						Missions {completedCount}/{missions.length}
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={activePanel === "schedule"}
						className={activePanel === "schedule" ? "active" : ""}
						onClick={() => setActivePanel("schedule")}
					>
						Schedule
					</button>
				</div>

				{activePanel === "missions" ? (
					<ul className="mission-list">
						{missions.map(mission => (
							<li className={completedMissions[mission.id] ? "complete" : ""} key={mission.id}>
								<span className="mission-check" aria-hidden="true">
									{completedMissions[mission.id] ? "✓" : "○"}
								</span>
								<span>
									<strong>{mission.title}</strong>
									<small>{mission.detail}</small>
								</span>
							</li>
						))}
					</ul>
				) : (
					<div className="schedule-panel">
						<div className="schedule-clock">{currentTime}<span> CAMPUS TIME</span></div>
						{classSchedule.map(item => (
							<div
								className={`schedule-item ${currentTime >= item.start && currentTime < item.end ? "current" : ""}`}
								key={item.start}
							>
								<time>{item.start}</time>
								<div>
									<strong>{item.title}</strong>
									<small>{item.location}</small>
								</div>
							</div>
						))}
					</div>
				)}
			</aside>

			{interactionPrompt && !dialogue && (
				<div className="interaction-prompt" role="status">{interactionPrompt}</div>
			)}

			{dialogue && (
				<section className="dialogue-panel" aria-live="polite" aria-label="Conversation">
					<div>
						<strong>{dialogue.speaker}</strong>
						<p>{dialogue.text}</p>
					</div>
					<button type="button" aria-label="Close conversation" onClick={onCloseDialogue}>×</button>
				</section>
			)}
		</>
	);
}
