


import { Engine } from "@babylonjs/core/Engines/engine";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Collisions/collisionCoordinator";

import {
  createAuditorium,
  createCampusBlock,
  createMainBuilding,
} from "./CampusBuildings";
import { CAMPUS_CONFIG } from "./GameConfig";
import { createStudent } from "./StudentCharacter";

export type CameraMode = "first" | "third";
export type MissionId = "talk-to-student" | "visit-computer-lab" | "attend-class" | "sit-in-auditorium";

export interface CampusGameCallbacks {
  onFloorChange?: (floor: number) => void;
  onInteractionPrompt?: (prompt: string | null) => void;
  onDialogueChange?: (dialogue: { speaker: string; text: string } | null) => void;
  onMissionComplete?: (mission: MissionId) => void;
}

export interface CampusGame {
  engine: Engine;
  scene: Scene;
  keys: Set<string>;
  setCameraMode: (mode: CameraMode) => void;
  dispose: () => void;
}

export async function createCampusGame(
  canvas: HTMLCanvasElement,
  callbacks: CampusGameCallbacks = {}
): Promise<CampusGame> {

  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);

  scene.clearColor = new Color4(0.57, 0.76, 0.91, 1);
  scene.collisionsEnabled = true;
  scene.gravity = new Vector3(0, -0.5, 0);

  // LIGHTING
  const ambient = new HemisphericLight(
    "ambient",
    new Vector3(0, 1, 0),
    scene
  );
  ambient.intensity = 0.85;

  const sun = new DirectionalLight(
    "sun",
    new Vector3(-1, -2, 1),
    scene
  );
  sun.position = new Vector3(30, 50, -30);
  sun.intensity = 1;

  // MATERIALS
  function mat(name: string, color: Color3) {
    const m = new StandardMaterial(name, scene);
    m.diffuseColor = color;
    return m;
  }

  const grass = mat("grass", new Color3(0.28, 0.48, 0.28));
  const asphalt = mat("road", new Color3(0.22, 0.24, 0.26));
  const concrete = mat("concrete", new Color3(0.78, 0.75, 0.68));
  const roofMat = mat("roof", new Color3(0.38, 0.20, 0.17));
  const green = mat("leaves", new Color3(0.12, 0.35, 0.15));
  const wood = mat("wood", new Color3(0.32, 0.18, 0.10));

  // CAMPUS GROUND
  const ground = MeshBuilder.CreateGround(
    "campus",
    {
      width: CAMPUS_CONFIG.ground.width,
      height: CAMPUS_CONFIG.ground.depth,
    },
    scene
  );

  ground.material = grass;
  ground.checkCollisions = true;

  // ROADS
  function createRoad(
    name: string,
    x: number,
    z: number,
    width: number,
    depth: number
  ) {
    const r = MeshBuilder.CreateGround(
      name,
      { width, height: depth },
      scene
    );

    r.position.set(x, 0.03, z);
    r.material = asphalt;
  }

  createRoad("northCampusRoad", 0, -39, 12, 62);
  createRoad("crossRoad", 0, -15, 100, 10);
  createRoad("southEntranceRoad", 0, 65, 12, 50);

  const mainBuilding = CAMPUS_CONFIG.buildings.main;
  const mainBuildingRoot = createMainBuilding(
    scene,
    new Vector3(mainBuilding.position.x, 0, mainBuilding.position.z)
  );

  const auditorium = CAMPUS_CONFIG.buildings.auditorium;
  const auditoriumRoot = createAuditorium(
    scene,
    new Vector3(auditorium.position.x, 0, auditorium.position.z)
  );

  for (const building of [
    CAMPUS_CONFIG.buildings.classroom,
    CAMPUS_CONFIG.buildings.computerLab,
    CAMPUS_CONFIG.buildings.library,
    CAMPUS_CONFIG.buildings.canteen,
    CAMPUS_CONFIG.buildings.administration,
  ]) {
    createCampusBlock(scene, building);
  }

  const courtyard = CAMPUS_CONFIG.courtyard;
  const plaza = MeshBuilder.CreateGround(
    "centralCourtyard",
    { width: courtyard.width, height: courtyard.depth },
    scene
  );
  plaza.position.set(courtyard.x, 0.05, courtyard.z);
  plaza.material = mat("courtyardStone", new Color3(0.66, 0.64, 0.57));

  const garden = MeshBuilder.CreateCylinder(
    "courtyardGarden",
    { height: 0.35, diameter: 9 },
    scene
  );
  garden.position.set(courtyard.x, 0.2, courtyard.z);
  garden.material = mat("courtyardGardenMaterial", new Color3(0.2, 0.38, 0.18));

  const fountain = MeshBuilder.CreateCylinder(
    "courtyardFountain",
    { height: 0.35, diameter: 4.5 },
    scene
  );
  fountain.position.set(courtyard.x, 0.55, courtyard.z);
  fountain.material = mat("courtyardWater", new Color3(0.25, 0.55, 0.62));

  const volleyballCourt = MeshBuilder.CreateGround(
    "volleyballCourt",
    {
      width: CAMPUS_CONFIG.sports.volleyball.width,
      height: CAMPUS_CONFIG.sports.volleyball.depth,
    },
    scene
  );
  volleyballCourt.position.set(
    CAMPUS_CONFIG.sports.volleyball.x,
    0.04,
    CAMPUS_CONFIG.sports.volleyball.z
  );
  volleyballCourt.material = mat("courtSurface", new Color3(0.66, 0.49, 0.31));

  // MAIN GATE
  function createPillar(x: number) {
    const p = MeshBuilder.CreateBox(
      "gatePillar",
      { width: 2, height: 7, depth: 2 },
      scene
    );

    p.position.set(x, 3.5, 67);
    p.material = concrete;
    p.checkCollisions = true;
  }

  createPillar(-7);
  createPillar(7);

  const gate = MeshBuilder.CreateBox(
    "gateTop",
    { width: 16, height: 1, depth: 2 },
    scene
  );

  gate.position.set(0, 7, 67);
  gate.material = roofMat;
  gate.checkCollisions = true;

  // TREES
  const treePositions = [
    [-66, -55], [-66, -8], [-66, 42],
    [66, -55], [66, -8], [66, 42],
    [-28, 57], [28, 57], [-28, -56],
    [28, -56],
  ];

  treePositions.forEach(([x, z], i) => {
    const trunk = MeshBuilder.CreateCylinder(
      "trunk" + i,
      { height: 3, diameter: 0.7 },
      scene
    );

    trunk.position.set(x, 1.5, z);
    trunk.material = wood;

    const leaves = MeshBuilder.CreateSphere(
      "leaves" + i,
      { diameter: 4 },
      scene
    );

    leaves.position.set(x, 4, z);
    leaves.material = green;
  });

  // PLAYER COLLISION BODY
  const player = MeshBuilder.CreateCapsule(
    "playerCollider",
    { height: 2, radius: 0.4 },
    scene
  );

  player.position.set(0, 1, 55);
  player.isVisible = false;
  player.checkCollisions = true;
  player.ellipsoid = new Vector3(0.4, 1, 0.4);

  const student = await createStudent(
    scene,
    new Vector3(CAMPUS_CONFIG.player.x, 0, CAMPUS_CONFIG.player.z)
  );

  const npcMaterial = mat("npcUniform", new Color3(0.82, 0.84, 0.76));
  const npcHairMaterial = mat("npcHair", new Color3(0.08, 0.07, 0.06));
  const npcSkinMaterial = mat("npcSkin", new Color3(0.64, 0.43, 0.31));
  const npcNames = ["May Thiri", "Ko Htet", "Ei Mon", "Aung Zaw"];
  const npcDialogue = [
    "The Computer Lab is on the first floor of the Main Building. Are you heading there?",
    "I have a programming class this morning. The classroom is upstairs.",
    "The library is a quiet place to study between classes.",
    "Our project group is meeting in the auditorium after lunch.",
  ];
  const npcs = npcNames.map((name, index) => {
    const root = new TransformNode(`studentNpc_${index}`, scene);
    root.position.set(index < 2 ? -10 + index * 6 : 4 + (index - 2) * 6, 0, 17 + (index % 2) * 6);

    const body = MeshBuilder.CreateCapsule(
      `studentNpcBody_${index}`,
      { height: 1.5, radius: 0.36 },
      scene
    );
    body.parent = root;
    body.position.y = 0.85;
    body.material = npcMaterial;

    const head = MeshBuilder.CreateSphere(
      `studentNpcHead_${index}`,
      { diameter: 0.48 },
      scene
    );
    head.parent = root;
    head.position.y = 1.85;
    head.material = npcSkinMaterial;

    const hair = MeshBuilder.CreateSphere(
      `studentNpcHair_${index}`,
      { diameter: 0.5 },
      scene
    );
    hair.parent = root;
    hair.position.y = 2.02;
    hair.scaling.y = 0.55;
    hair.material = npcHairMaterial;

    const startX = root.position.x;
    return {
      name,
      dialogue: npcDialogue[index],
      root,
      minX: startX - 5,
      maxX: startX + 5,
      direction: index % 2 === 0 ? 1 : -1,
    };
  });

  const mainBuildingMeshes = new Set(mainBuildingRoot.getChildMeshes());
  const auditoriumMeshes = new Set(auditoriumRoot.getChildMeshes());
  const studentMeshes = new Set(student.root.getChildMeshes());
  const campusExteriorMeshes = scene.meshes
    .filter(
      mesh =>
        mesh !== player &&
        !mainBuildingMeshes.has(mesh) &&
        !auditoriumMeshes.has(mesh) &&
        !studentMeshes.has(mesh)
    )
    .map(mesh => ({ mesh, wasEnabled: mesh.isEnabled() }));
  let campusExteriorHidden = false;

  // CAMERA
  const camera = new ArcRotateCamera(
    "playerCamera",
    Math.PI / 2,
    1.15,
    9,
    new Vector3(
      CAMPUS_CONFIG.player.x,
      2,
      CAMPUS_CONFIG.player.z
    ),
    scene
  );

  camera.lowerRadiusLimit = 0.15;
  camera.upperRadiusLimit = 18;
  camera.lowerBetaLimit = 0.3;
  camera.upperBetaLimit = 1.5;
  camera.wheelPrecision = 35;
  camera.panningSensibility = 0;
  camera.attachControl(canvas, true);

  let cameraMode: CameraMode = "third";
  let currentFloor = 1;
  let isSitting = false;
  let interactionKeyWasDown = false;
  let activeRoom = "";
  let activePrompt: string | null = null;
  let stairTransition: {
    lane: 1 | 2;
    fromFloor: number;
    toFloor: number;
  } | null = null;

  function setCameraMode(mode: CameraMode) {
    cameraMode = mode;

    if (mode === "first") {
      camera.radius = 0.2;
      student.root.setEnabled(false);
    } else {
      camera.radius = campusExteriorHidden ? 3.5 : 9;
      student.root.setEnabled(true);
    }
  }

  // KEYBOARD
  const keys = new Set<string>();
  const justPressed = new Set<string>();

  const onDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (!keys.has(key)) {
      justPressed.add(key);
    }
    keys.add(key);

    if (["w", "a", "s", "d", "arrowup",
      "arrowdown", "arrowleft", "arrowright", " "].includes(key)) {
      e.preventDefault();
    }
  };

  const onUp = (e: KeyboardEvent) => {
    keys.delete(e.key.toLowerCase());
  };

  window.addEventListener("keydown", onDown);
  window.addEventListener("keyup", onUp);

  // PLAYER MOVEMENT AND INTERACTIONS
  scene.onBeforeRenderObservable.add(() => {
    const dt = Math.min(engine.getDeltaTime() / 1000, 0.05);

    npcs.forEach(npc => {
      npc.root.position.x += npc.direction * 1.15 * dt;
      if (npc.root.position.x >= npc.maxX) {
        npc.root.position.x = npc.maxX;
        npc.direction = -1;
      } else if (npc.root.position.x <= npc.minX) {
        npc.root.position.x = npc.minX;
        npc.direction = 1;
      }
      npc.root.rotation.y = npc.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
    });

    const forward = camera.target.subtract(camera.position);
    forward.y = 0;
    forward.normalize();

    const right = Vector3.Cross(forward, Vector3.Up()).normalize();

    const direction = Vector3.Zero();

    if (keys.has("w") || keys.has("arrowup"))
      direction.addInPlace(forward);

    if (keys.has("s") || keys.has("arrowdown"))
      direction.subtractInPlace(forward);

    if (keys.has("d") || keys.has("arrowright"))
      direction.addInPlace(right);

    if (keys.has("a") || keys.has("arrowleft"))
      direction.subtractInPlace(right);

    const moving = direction.lengthSquared() > 0 && !isSitting;

    if (moving) {
      direction.normalize();

      const sprint = keys.has("shift");
      const speed = sprint
        ? CAMPUS_CONFIG.player.runSpeed
        : CAMPUS_CONFIG.player.speed;

      player.moveWithCollisions(
        direction.scale(speed * dt)
      );

      student.root.rotation.y = Math.atan2(
        direction.x,
        direction.z
      );

      student.play(sprint ? "run" : "walk");
    } else {
      student.play("idle");
    }

    const mainBuildingCenterZ = mainBuilding.position.z;
    const stairLocalZ = player.position.z - mainBuildingCenterZ;
    const inFirstStairLane = Math.abs(player.position.x - 22.5) <= 1.7;
    const inSecondStairLane = Math.abs(player.position.x - 26) <= 1.7;
    const atFrontLanding = stairLocalZ >= 6.5;
    const atRearLanding = stairLocalZ <= -6.5;

    if (!stairTransition) {
      if (inFirstStairLane && currentFloor === 1 && atFrontLanding && direction.z < -0.1) {
        stairTransition = { lane: 1, fromFloor: 1, toFloor: 2 };
      } else if (inFirstStairLane && currentFloor === 2 && atRearLanding && direction.z > 0.1) {
        stairTransition = { lane: 1, fromFloor: 2, toFloor: 1 };
      } else if (inSecondStairLane && currentFloor === 2 && atRearLanding && direction.z > 0.1) {
        stairTransition = { lane: 2, fromFloor: 2, toFloor: 3 };
      } else if (inSecondStairLane && currentFloor === 3 && atFrontLanding && direction.z < -0.1) {
        stairTransition = { lane: 2, fromFloor: 3, toFloor: 2 };
      }
    }

    if (stairTransition) {
      const progress = stairTransition.lane === 1
        ? stairTransition.fromFloor === 1
          ? (7.5 - stairLocalZ) / 15
          : (stairLocalZ + 7.5) / 15
        : stairTransition.fromFloor === 2
          ? (stairLocalZ + 7.5) / 15
          : (7.5 - stairLocalZ) / 15;
      const clampedProgress = Math.max(0, Math.min(1, progress));
      const floorHeight = mainBuilding.floorHeight;
      const startY = 1 + (stairTransition.fromFloor - 1) * floorHeight;
      const endY = 1 + (stairTransition.toFloor - 1) * floorHeight;
      player.position.y = startY + (endY - startY) * clampedProgress;

      if (progress >= 1) {
        player.position.y = endY;
        currentFloor = stairTransition.toFloor;
        callbacks.onFloorChange?.(currentFloor);
        stairTransition = null;
      } else if (progress <= 0) {
        player.position.y = startY;
        stairTransition = null;
      }
    }

    student.root.position.set(
      player.position.x,
      player.position.y - 1,
      player.position.z
    );

    const localPlayerX = player.position.x - mainBuilding.position.x;
    const localPlayerZ = player.position.z - mainBuilding.position.z;
    const insideMainBuilding =
      Math.abs(localPlayerX) < mainBuilding.width / 2 - 1 &&
      localPlayerZ < mainBuilding.depth / 2 - 1 &&
      localPlayerZ > -mainBuilding.depth / 2 + 1 &&
      player.position.y < mainBuilding.floors * mainBuilding.floorHeight;
    const auditoriumLocalX = player.position.x - auditorium.position.x;
    const auditoriumLocalZ = player.position.z - auditorium.position.z;
    const insideAuditorium =
      Math.abs(auditoriumLocalX) < 15 &&
      Math.abs(auditoriumLocalZ) < 10 &&
      player.position.y < 6;
    const insideIndoorArea = insideMainBuilding || insideAuditorium;

    if (insideIndoorArea !== campusExteriorHidden) {
      campusExteriorHidden = insideIndoorArea;
      camera.radius = cameraMode === "first"
        ? 0.2
        : insideIndoorArea
          ? 3.5
          : 9;
      campusExteriorMeshes.forEach(({ mesh, wasEnabled }) => {
        mesh.setEnabled(!insideIndoorArea && wasEnabled);
      });
    }

    const nearestNpc = npcs
      .map(npc => ({
        npc,
        distance: Vector3.Distance(
          new Vector3(player.position.x, 0, player.position.z),
          npc.root.position
        ),
      }))
      .sort((left, right) => left.distance - right.distance)[0];
    const nearestSeat = scene.meshes
      .filter(mesh => mesh.metadata?.interaction === "auditorium-seat")
      .map(mesh => {
        mesh.computeWorldMatrix(true);
        const seatPosition = mesh.getAbsolutePosition();
        return {
          position: seatPosition,
          distance: Vector3.Distance(
            new Vector3(player.position.x, 0, player.position.z),
            new Vector3(seatPosition.x, 0, seatPosition.z)
          ),
        };
      })
      .sort((left, right) => left.distance - right.distance)[0];

    const interactDown = keys.has("e");
    const interactPressed =
      justPressed.has("e") || (interactDown && !interactionKeyWasDown);
    justPressed.delete("e");
    if (interactPressed) {
      if (isSitting) {
        player.position.z += 1.4;
        isSitting = false;
        student.root.setEnabled(cameraMode !== "first");
        callbacks.onDialogueChange?.(null);
      } else if (nearestNpc && nearestNpc.distance <= 3.2) {
        callbacks.onDialogueChange?.({
          speaker: nearestNpc.npc.name,
          text: nearestNpc.npc.dialogue,
        });
        callbacks.onMissionComplete?.("talk-to-student");
      } else if (insideAuditorium && nearestSeat && nearestSeat.distance <= 2.4) {
        player.position.set(
          nearestSeat.position.x,
          1,
          nearestSeat.position.z + 1
        );
        isSitting = true;
        student.root.setEnabled(false);
        callbacks.onDialogueChange?.({
          speaker: "Auditorium",
          text: "You are seated. Press E to stand up.",
        });
        callbacks.onMissionComplete?.("sit-in-auditorium");
      }
    }
    interactionKeyWasDown = interactDown;
    justPressed.clear();

    if (insideMainBuilding && localPlayerZ < 2.4 && localPlayerZ > -8.5) {
      const roomColumn = Math.floor((localPlayerX + 21) / 10.5);
      const roomNames = [
        ["Student Affairs", "Classroom", "Computer Lab", "Physics Lab"],
        ["Administration Office", "Meeting Room", "Classroom", "Computer Lab"],
        ["Library", "Reading Room", "Meeting Room", "Faculty Office"],
      ];
      const roomName = roomNames[currentFloor - 1]?.[roomColumn];
      const roomKey = roomName ? `${currentFloor}:${roomName}` : "";
      if (roomKey && roomKey !== activeRoom) {
        if (roomName === "Classroom") {
          callbacks.onMissionComplete?.("attend-class");
        } else if (roomName === "Computer Lab") {
          callbacks.onMissionComplete?.("visit-computer-lab");
        }
      }
      activeRoom = roomKey;
    } else {
      activeRoom = "";
    }

    let prompt: string | null = null;
    if (isSitting) {
      prompt = "Press E to stand";
    } else if (nearestNpc && nearestNpc.distance <= 3.2) {
      prompt = `Press E to talk with ${nearestNpc.npc.name}`;
    } else if (insideAuditorium && nearestSeat && nearestSeat.distance <= 2.4) {
      prompt = "Press E to sit";
    }
    if (prompt !== activePrompt) {
      activePrompt = prompt;
      callbacks.onInteractionPrompt?.(prompt);
    }

    camera.target.copyFromFloats(
      player.position.x,
      player.position.y + (cameraMode === "first" ? 1.6 : 1.2),
      player.position.z
    );
  });

  engine.runRenderLoop(() => {
    scene.render();
  });

  const resize = () => engine.resize();
  window.addEventListener("resize", resize);

  return {
    engine,
    scene,
    keys,
    setCameraMode,
    dispose: () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("resize", resize);
      engine.dispose();
    },
  };
}
