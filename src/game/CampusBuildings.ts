
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Scene } from "@babylonjs/core/scene";

function material(
  scene: Scene,
  name: string,
  color: Color3
) {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = color;
  return m;
}

interface CampusBlockConfig {
  name: string;
  position: { x: number; z: number };
  width: number;
  depth: number;
  floors: number;
  floorHeight: number;
  rotationY?: number;
}

export function createCampusBlock(
  scene: Scene,
  config: CampusBlockConfig
) {
  const root = new TransformNode(`${config.name}Root`, scene);
  root.position.set(config.position.x, 0, config.position.z);
  root.rotation.y = config.rotationY ?? 0;

  const height = config.floors * config.floorHeight;
  const wall = material(
    scene,
    `${config.name}Wall`,
    new Color3(0.82, 0.81, 0.76)
  );
  const frame = material(
    scene,
    `${config.name}Frame`,
    new Color3(0.68, 0.71, 0.71)
  );
  const glass = material(
    scene,
    `${config.name}Glass`,
    new Color3(0.12, 0.34, 0.43)
  );

  const body = MeshBuilder.CreateBox(
    `${config.name}Body`,
    { width: config.width, depth: config.depth, height },
    scene
  );
  body.parent = root;
  body.position.y = height / 2;
  body.material = wall;
  body.checkCollisions = true;

  const roof = MeshBuilder.CreateBox(
    `${config.name}Roof`,
    {
      width: config.width + 0.8,
      depth: config.depth + 0.8,
      height: 0.5,
    },
    scene
  );
  roof.parent = root;
  roof.position.y = height + 0.25;
  roof.material = frame;

  for (let floor = 0; floor < config.floors; floor++) {
    for (let column = 0; column < 4; column++) {
      const window = MeshBuilder.CreateBox(
        `${config.name}Window_${floor}_${column}`,
        { width: 2, height: 1.8, depth: 0.12 },
        scene
      );
      window.parent = root;
      window.position.set(
        -config.width / 2 + ((column + 1) * config.width) / 5,
        floor * config.floorHeight + config.floorHeight / 2,
        config.depth / 2 + 0.06
      );
      window.material = glass;
    }
  }

  return root;
}

export function createMainBuilding(
  scene: Scene,
  position: Vector3
) {
  const root = new TransformNode("mainBuildingRoot", scene);
  root.position.copyFrom(position);

  const white = material(
    scene, "buildingWhite",
    new Color3(0.88, 0.87, 0.81)
  );

  const frame = material(
    scene, "buildingFrame",
    new Color3(0.72, 0.75, 0.76)
  );

  const glass = material(
    scene, "buildingGlass",
    new Color3(0.12, 0.35, 0.46)
  );

  const furniture = material(
    scene,
    "buildingFurniture",
    new Color3(0.39, 0.26, 0.15)
  );

  const ground = material(
    scene, "buildingFloor",
    new Color3(0.65, 0.64, 0.60)
  );

  const width = 58;
  const depth = 18;
  const floorHeight = 4;
  const floors = 3;
  const height = floorHeight * floors;

  const wallThickness = 1;
  const doorwayWidth = 8;
  const doorwayHeight = 3.5;
  const frontWallWidth = (width - doorwayWidth) / 2;

  function createWall(
    name: string,
    wallWidth: number,
    wallHeight: number,
    wallDepth: number,
    x: number,
    y: number,
    z: number
  ) {
    const wall = MeshBuilder.CreateBox(
      name,
      { width: wallWidth, height: wallHeight, depth: wallDepth },
      scene
    );

    wall.parent = root;
    wall.position.set(x, y, z);
    wall.material = white;
    wall.checkCollisions = true;
  }

  createWall(
    "frontWallLeft",
    frontWallWidth,
    height,
    wallThickness,
    -(doorwayWidth / 2 + frontWallWidth / 2),
    height / 2,
    depth / 2 - wallThickness / 2
  );
  createWall(
    "frontWallRight",
    frontWallWidth,
    height,
    wallThickness,
    doorwayWidth / 2 + frontWallWidth / 2,
    height / 2,
    depth / 2 - wallThickness / 2
  );
  createWall(
    "frontWallAboveEntrance",
    doorwayWidth,
    height - doorwayHeight,
    wallThickness,
    0,
    doorwayHeight + (height - doorwayHeight) / 2,
    depth / 2 - wallThickness / 2
  );
  createWall(
    "rearWall",
    width,
    height,
    wallThickness,
    0,
    height / 2,
    -depth / 2 + wallThickness / 2
  );
  createWall(
    "leftWall",
    wallThickness,
    height,
    depth,
    -width / 2 + wallThickness / 2,
    height / 2,
    0
  );
  createWall(
    "rightWall",
    wallThickness,
    height,
    depth,
    width / 2 - wallThickness / 2,
    height / 2,
    0
  );

  const roomsByFloor = [
    ["Student Affairs", "Classroom", "Computer Lab", "Physics Lab"],
    ["Administration Office", "Meeting Room", "Classroom", "Computer Lab"],
    ["Library", "Reading Room", "Meeting Room", "Faculty Office"],
  ];
  const roomWidth = 10.5;
  const firstRoomCenter = -15.75;
  const roomBackZ = -depth / 2 + wallThickness;
  const roomFrontZ = 2.4;
  const roomDepth = roomFrontZ - roomBackZ;
  const roomDoorWidth = 1.8;

  for (let floor = 0; floor < floors; floor++) {
    const floorY = floor * floorHeight;
    const floorMesh = MeshBuilder.CreateGround(
      `mainFloor_${floor + 1}`,
      { width: width - wallThickness * 2, height: depth - wallThickness * 2 },
      scene
    );
    floorMesh.parent = root;
    floorMesh.position.y = floorY + 0.04;
    floorMesh.material = ground;

    for (let column = 0; column < 3; column++) {
      createWall(
        `roomPartition_${floor + 1}_${column}`,
        wallThickness * 0.3,
        floorHeight,
        roomDepth,
        -10.5 + column * roomWidth,
        floorY + floorHeight / 2,
        (roomBackZ + roomFrontZ) / 2
      );
    }

    roomsByFloor[floor].forEach((roomName, column) => {
      const roomCenter = firstRoomCenter + column * roomWidth;
      const roomLeft = roomCenter - roomWidth / 2;
      const doorSideWidth = (roomWidth - roomDoorWidth) / 2;
      const doorWallZ = roomFrontZ;
      const doorWallDepth = 0.3;

      createWall(
        `roomDoorWallLeft_${floor + 1}_${column}`,
        doorSideWidth,
        floorHeight,
        doorWallDepth,
        roomLeft + doorSideWidth / 2,
        floorY + floorHeight / 2,
        doorWallZ
      );
      createWall(
        `roomDoorWallRight_${floor + 1}_${column}`,
        doorSideWidth,
        floorHeight,
        doorWallDepth,
        roomCenter + roomDoorWidth / 2 + doorSideWidth / 2,
        floorY + floorHeight / 2,
        doorWallZ
      );
      createWall(
        `roomDoorHeader_${floor + 1}_${column}`,
        roomDoorWidth,
        floorHeight - 2.3,
        doorWallDepth,
        roomCenter,
        floorY + 2.3 + (floorHeight - 2.3) / 2,
        doorWallZ
      );

      const signTexture = new DynamicTexture(
        `roomSignTexture_${floor + 1}_${column}`,
        { width: 512, height: 128 },
        scene
      );
      signTexture.drawText(
        roomName,
        null,
        84,
        "bold 42px Arial",
        "#f4f1e8",
        "#26343a",
        true
      );

      const signMaterial = new StandardMaterial(
        `roomSignMaterial_${floor + 1}_${column}`,
        scene
      );
      signMaterial.diffuseTexture = signTexture;
      signMaterial.emissiveColor = Color3.White();
      signMaterial.backFaceCulling = false;

      const sign = MeshBuilder.CreatePlane(
        `roomSign_${floor + 1}_${column}`,
        { width: 4.2, height: 1.05 },
        scene
      );
      sign.parent = root;
      sign.position.set(roomCenter, floorY + 3.05, doorWallZ + 0.18);
      sign.material = signMaterial;

      if (roomName === "Classroom") {
        const board = MeshBuilder.CreateBox(
          `classroomWhiteboard_${floor + 1}_${column}`,
          { width: 4.4, height: 1.7, depth: 0.12 },
          scene
        );
        board.parent = root;
        board.position.set(roomCenter, floorY + 2.7, roomBackZ + 0.3);
        board.material = material(
          scene,
          `classroomWhiteboardMaterial_${floor + 1}_${column}`,
          new Color3(0.9, 0.92, 0.86)
        );

        for (let row = 0; row < 2; row++) {
          for (let seat = 0; seat < 2; seat++) {
            const deskX = roomCenter + (seat === 0 ? -1.8 : 1.8);
            const deskZ = -5.3 + row * 2.7;
            const classroomDesk = MeshBuilder.CreateBox(
              `classroomDesk_${floor + 1}_${column}_${row}_${seat}`,
              { width: 2.2, height: 0.14, depth: 0.9 },
              scene
            );
            classroomDesk.parent = root;
            classroomDesk.position.set(deskX, floorY + 0.85, deskZ);
            classroomDesk.material = furniture;

            const chair = MeshBuilder.CreateBox(
              `classroomChair_${floor + 1}_${column}_${row}_${seat}`,
              { width: 0.7, height: 0.75, depth: 0.7 },
              scene
            );
            chair.parent = root;
            chair.position.set(deskX, floorY + 0.4, deskZ + 0.8);
            chair.material = frame;
          }
        }
      } else if (roomName === "Computer Lab") {
        for (let station = 0; station < 3; station++) {
          const stationX = roomCenter + (station - 1) * 3;
          const desk = MeshBuilder.CreateBox(
            `computerDesk_${floor + 1}_${column}_${station}`,
            { width: 2.5, height: 0.14, depth: 1.2 },
            scene
          );
          desk.parent = root;
          desk.position.set(stationX, floorY + 0.85, -3.2);
          desk.material = furniture;

          const monitor = MeshBuilder.CreateBox(
            `computerMonitor_${floor + 1}_${column}_${station}`,
            { width: 1.05, height: 0.75, depth: 0.12 },
            scene
          );
          monitor.parent = root;
          monitor.position.set(stationX, floorY + 1.35, -3.45);
          monitor.material = glass;

          const keyboard = MeshBuilder.CreateBox(
            `computerKeyboard_${floor + 1}_${column}_${station}`,
            { width: 0.8, height: 0.06, depth: 0.28 },
            scene
          );
          keyboard.parent = root;
          keyboard.position.set(stationX, floorY + 0.97, -2.85);
          keyboard.material = frame;
        }
      } else if (roomName === "Physics Lab") {
        for (let bench = 0; bench < 2; bench++) {
          const benchZ = -5 + bench * 3.2;
          const labBench = MeshBuilder.CreateBox(
            `physicsBench_${floor + 1}_${column}_${bench}`,
            { width: 7.4, height: 0.18, depth: 1.2 },
            scene
          );
          labBench.parent = root;
          labBench.position.set(roomCenter, floorY + 0.95, benchZ);
          labBench.material = furniture;

          for (let experiment = 0; experiment < 3; experiment++) {
            const apparatus = MeshBuilder.CreateCylinder(
              `physicsApparatus_${floor + 1}_${column}_${bench}_${experiment}`,
              { height: 0.9, diameter: 0.18 },
              scene
            );
            apparatus.parent = root;
            apparatus.position.set(
              roomCenter - 2.5 + experiment * 2.5,
              floorY + 1.5,
              benchZ
            );
            apparatus.material = glass;
          }
        }
      } else {
        const desk = MeshBuilder.CreateBox(
          `roomDesk_${floor + 1}_${column}`,
          { width: 3.2, height: 0.16, depth: 1.25 },
          scene
        );
        desk.parent = root;
        desk.position.set(roomCenter, floorY + 0.9, -3.2);
        desk.material = furniture;
      }
    });
  }

  const stairWidth = 2.8;
  const stairXPositions = [22.5, 26];
  for (let step = 0; step < 16; step++) {
    const lowerToMiddle = MeshBuilder.CreateBox(
      `stairFlightOne_${step}`,
      { width: stairWidth, height: 0.25, depth: 1 },
      scene
    );
    lowerToMiddle.parent = root;
    lowerToMiddle.position.set(
      stairXPositions[0],
      step * 0.25 + 0.125,
      7.5 - step
    );
    lowerToMiddle.material = frame;

    const middleToUpper = MeshBuilder.CreateBox(
      `stairFlightTwo_${step}`,
      { width: stairWidth, height: 0.25, depth: 1 },
      scene
    );
    middleToUpper.parent = root;
    middleToUpper.position.set(
      stairXPositions[1],
      floorHeight + step * 0.25 + 0.125,
      -7.5 + step
    );
    middleToUpper.material = frame;
  }

  // Roof
  const roof = MeshBuilder.CreateBox(
    "mainBuildingRoof",
    { width: width + 1, height: 0.5, depth: depth + 1 },
    scene
  );

  roof.parent = root;
  roof.position.y = height + 0.25;
  roof.material = frame;

  // Front facade windows
  const frontZ = depth / 2 + 0.08;

  for (let floor = 0; floor < floors; floor++) {
    const y = floor * floorHeight + 2.1;

    for (let i = 0; i < 14; i++) {
      const x = -26 + i * 4;

      // Leave the central entrance area clear
      if (floor === 0 && Math.abs(x) < 5) continue;

      const window = MeshBuilder.CreateBox(
        `frontWindow_${floor}_${i}`,
        { width: 2.65, height: 2.3, depth: 0.12 },
        scene
      );

      window.parent = root;
      window.position.set(x, y, frontZ);
      window.material = glass;

      // Window frame
      const border = MeshBuilder.CreateBox(
        `windowFrame_${floor}_${i}`,
        { width: 2.9, height: 2.55, depth: 0.08 },
        scene
      );

      border.parent = root;
      border.position.set(x, y, frontZ - 0.08);
      border.material = frame;
    }
  }

  // Horizontal floor lines
  for (let i = 1; i < floors; i++) {
    const line = MeshBuilder.CreateBox(
      `floorLine_${i}`,
      { width: width + 0.3, height: 0.18, depth: 0.2 },
      scene
    );

    line.parent = root;
    line.position.set(0, i * floorHeight, frontZ + 0.04);
    line.material = frame;
  }

  // Central entrance canopy
  const canopy = MeshBuilder.CreateBox(
    "mainEntranceCanopy",
    { width: 17, height: 1, depth: 7 },
    scene
  );

  canopy.parent = root;
  canopy.position.set(0, 9.5, 12);
  canopy.material = white;

  // Entrance columns
  for (const x of [-8, -5, 5, 8]) {
    const pillar = MeshBuilder.CreateBox(
      "entrancePillar",
      { width: 0.8, height: 8, depth: 0.8 },
      scene
    );

    pillar.parent = root;
    pillar.position.set(x, 4, 9);
    pillar.material = frame;
  }

  // University sign
  const sign = MeshBuilder.CreateBox(
    "universitySign",
    { width: 18, height: 3, depth: 0.35 },
    scene
  );

  sign.parent = root;
  sign.position.set(0, 13.5, frontZ + 0.3);
  sign.material = white;

  // Entrance stairs
  for (let i = 0; i < 5; i++) {
    const stair = MeshBuilder.CreateBox(
      `entranceStair_${i}`,
      {
        width: 17 + i * 1.2,
        height: 0.35,
        depth: 1.1,
      },
      scene
    );

    stair.parent = root;
    stair.position.set(
      0,
      0.2 + i * 0.35,
      10 + i * 1.1
    );

    stair.material = ground;
  }

  // Building roof sign board support
  const signTop = MeshBuilder.CreateBox(
    "signTop",
    { width: 20, height: 3.5, depth: 0.4 },
    scene
  );

  signTop.parent = root;
  signTop.position.set(0, 14.3, frontZ);

  signTop.material = white;

  return root;
}

// Auditorium interior
export function createAuditorium(scene: Scene, position: Vector3) {
  const root = new TransformNode("auditorium", scene);
  root.position.copyFrom(position);

  const wall = material(
    scene, "hallWall",
    new Color3(0.83, 0.82, 0.78)
  );

  const floor = material(
    scene, "hallFloor",
    new Color3(0.28, 0.27, 0.25)
  );

  const seat = material(
    scene, "hallSeat",
    new Color3(0.08, 0.15, 0.25)
  );

  const stageMat = material(
    scene, "stageMat",
    new Color3(0.25, 0.13, 0.10)
  );

  const hallWidth = 32;
  const hallDepth = 22;
  const hallHeight = 7;
  const wallThickness = 1;
  const entranceWidth = 4;

  function createHallWall(
    name: string,
    width: number,
    height: number,
    depth: number,
    x: number,
    y: number,
    z: number
  ) {
    const hallWall = MeshBuilder.CreateBox(
      name,
      { width, height, depth },
      scene
    );
    hallWall.parent = root;
    hallWall.position.set(x, y, z);
    hallWall.material = wall;
    hallWall.checkCollisions = true;
  }

  const sideWidth = (hallWidth - entranceWidth) / 2;
  createHallWall(
    "auditoriumFrontLeft",
    sideWidth,
    hallHeight,
    wallThickness,
    -(entranceWidth / 2 + sideWidth / 2),
    hallHeight / 2,
    hallDepth / 2 - wallThickness / 2
  );
  createHallWall(
    "auditoriumFrontRight",
    sideWidth,
    hallHeight,
    wallThickness,
    entranceWidth / 2 + sideWidth / 2,
    hallHeight / 2,
    hallDepth / 2 - wallThickness / 2
  );
  createHallWall(
    "auditoriumFrontHeader",
    entranceWidth,
    hallHeight - 3,
    wallThickness,
    0,
    5.5,
    hallDepth / 2 - wallThickness / 2
  );
  createHallWall(
    "auditoriumBack",
    hallWidth,
    hallHeight,
    wallThickness,
    0,
    hallHeight / 2,
    -hallDepth / 2 + wallThickness / 2
  );
  createHallWall(
    "auditoriumLeft",
    wallThickness,
    hallHeight,
    hallDepth,
    -hallWidth / 2 + wallThickness / 2,
    hallHeight / 2,
    0
  );
  createHallWall(
    "auditoriumRight",
    wallThickness,
    hallHeight,
    hallDepth,
    hallWidth / 2 - wallThickness / 2,
    hallHeight / 2,
    0
  );

  const hallFloor = MeshBuilder.CreateGround(
    "auditoriumFloor",
    { width: 31, height: 21 },
    scene
  );

  hallFloor.parent = root;
  hallFloor.position.y = 0.08;
  hallFloor.material = floor;

  // Stage
  const stage = MeshBuilder.CreateBox(
    "auditoriumStage",
    { width: 22, height: 0.8, depth: 5 },
    scene
  );

  stage.parent = root;
  stage.position.set(0, 0.4, -7);
  stage.material = stageMat;

  // Screen
  const screen = MeshBuilder.CreateBox(
    "projectorScreen",
    { width: 12, height: 4, depth: 0.15 },
    scene
  );

  screen.parent = root;
  screen.position.set(0, 3.5, -10);
  screen.material = material(
    scene, "projectorScreenMaterial",
    new Color3(0.9, 0.92, 0.9)
  );

  // Student seats
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 8; col++) {
      const chair = MeshBuilder.CreateBox(
        `hallChair_${row}_${col}`,
        { width: 0.8, height: 1, depth: 0.8 },
        scene
      );

      chair.parent = root;
      chair.metadata = { interaction: "auditorium-seat" };
      chair.position.set(
        -12 + col * 3.4,
        0.5,
        1 + row * 2.3
      );

      chair.material = seat;
    }
  }

  return root;
}
