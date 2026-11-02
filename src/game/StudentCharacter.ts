
import { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Scene } from "@babylonjs/core/scene";

import "@babylonjs/loaders/glTF";

export interface Student {
  root: TransformNode;
  animations: AnimationGroup[];
  play: (name: "idle" | "walk" | "run") => void;
}

function createMaterial(
  scene: Scene,
  name: string,
  color: Color3
) {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = color;
  return m;
}

export async function createStudent(
  scene: Scene,
  position: Vector3
): Promise<Student> {

  const root = new TransformNode("studentRoot", scene);
  root.position.copyFrom(position);

  let animations: AnimationGroup[] = [];
  let currentAnimation: AnimationGroup | undefined;

  // Load custom realistic character
  try {
    const result = await SceneLoader.ImportMeshAsync(
      "",
      "/assets/models/",
      "student.glb",
      scene
    );

    const importedRoot = new TransformNode(
      "studentModelRoot",
      scene
    );

    result.meshes.forEach(mesh => {
      if (mesh.parent === null) {
        mesh.parent = importedRoot;
      }
    });

    importedRoot.parent = root;

    // Adjust these after checking the actual GLB dimensions
    importedRoot.scaling.setAll(1);
    importedRoot.position.y = 0;

    animations = result.animationGroups;

  } catch (error) {
    console.warn(
      "Student model unavailable. Loading uniform placeholder.",
      error
    );

    const shirt = createMaterial(
      scene,
      "whiteUniform",
      new Color3(0.92, 0.92, 0.86)
    );

    const longyi = createMaterial(
      scene,
      "greenLongyi",
      new Color3(0.035, 0.20, 0.105)
    );

    const skin = createMaterial(
      scene,
      "skin",
      new Color3(0.67, 0.43, 0.31)
    );

    const hair = createMaterial(
      scene,
      "blackHair",
      new Color3(0.025, 0.025, 0.03)
    );

    const shoe = createMaterial(
      scene,
      "blackShoes",
      new Color3(0.03, 0.03, 0.035)
    );

    // Body / Shirt
    const torso = MeshBuilder.CreateBox(
      "uniformShirt",
      { width: 0.85, height: 0.85, depth: 0.42 },
      scene
    );

    torso.parent = root;
    torso.position.y = 1.35;
    torso.material = shirt;

    // Collar
    const collar = MeshBuilder.CreateBox(
      "shirtCollar",
      { width: 0.35, height: 0.13, depth: 0.43 },
      scene
    );

    collar.parent = root;
    collar.position.set(0, 1.8, -0.01);
    collar.material = shirt;

    // Head
    const head = MeshBuilder.CreateSphere(
      "studentHead",
      { diameter: 0.48 },
      scene
    );

    head.parent = root;
    head.position.y = 2.05;
    head.material = skin;

    // Hair
    const hairMesh = MeshBuilder.CreateSphere(
      "studentHair",
      { diameter: 0.5 },
      scene
    );

    hairMesh.parent = root;
    hairMesh.scaling.y = 0.65;
    hairMesh.position.y = 2.2;
    hairMesh.material = hair;

    // Longyi
    const lower = MeshBuilder.CreateCylinder(
      "studentLongyi",
      {
        height: 0.95,
        diameterTop: 0.85,
        diameterBottom: 0.9,
      },
      scene
    );

    lower.parent = root;
    lower.position.y = 0.48;
    lower.material = longyi;

    // Arms
    for (const side of [-1, 1]) {
      const arm = MeshBuilder.CreateCylinder(
        "uniformArm",
        {
          height: 0.8,
          diameterTop: 0.22,
          diameterBottom: 0.18,
        },
        scene
      );

      arm.parent = root;
      arm.position.set(side * 0.55, 1.35, 0);
      arm.material = shirt;

      const hand = MeshBuilder.CreateSphere(
        "studentHand",
        { diameter: 0.2 },
        scene
      );

      hand.parent = root;
      hand.position.set(side * 0.55, 0.9, 0);
      hand.material = skin;

      const foot = MeshBuilder.CreateBox(
        "studentShoe",
        { width: 0.3, height: 0.15, depth: 0.45 },
        scene
      );

      foot.parent = root;
      foot.position.set(side * 0.22, 0.08, 0.08);
      foot.material = shoe;
    }
  }

  function play(name: "idle" | "walk" | "run") {
    const animation = animations.find(a =>
      a.name.toLowerCase().includes(name)
    );

    if (!animation || currentAnimation === animation) return;

    animations.forEach(a => a.stop());
    animation.start(true);
    currentAnimation = animation;
  }

  play("idle");

  return {
    root,
    animations,
    play,
  };
}
