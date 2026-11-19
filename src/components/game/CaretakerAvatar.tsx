import { useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AnimationMixer, LoopOnce, Vector3, type Object3D } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils, type VRM } from '@pixiv/three-vrm';
import {
  createVRMAnimationClip, VRMAnimationLoaderPlugin, VRMLookAtQuaternionProxy,
} from '@pixiv/three-vrm-animation';

type Avatar = {
  vrm: VRM;
  mixer: AnimationMixer;
  scale: number;
  head: Object3D | null;
};

async function readAsset(path: string, signal: AbortSignal) {
  const response = await fetch(path, { signal });
  if (!response.ok) throw new Error(`Could not load ${path}: HTTP ${response.status}`);
  return response.arrayBuffer();
}

export default function CaretakerAvatar({ talking, children }: {
  talking: boolean;
  children: React.ReactNode;
}) {
  const canvas = useThree((state) => state.gl.domElement);
  const [avatar, setAvatar] = useState<Avatar>();
  const [greeting, setGreeting] = useState<ReturnType<AnimationMixer['clipAction']>>();

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    let loaded: Avatar | undefined;

    async function load() {
      const model = await readAsset('/models/caretaker.vrm', signal);
      const loader = new GLTFLoader();
      loader.register((parser) => new VRMLoaderPlugin(parser));
      const gltf = await loader.parseAsync(model, '/models/');
      const vrm = gltf.userData.vrm as VRM | undefined;
      if (signal.aborted || !vrm) {
        VRMUtils.deepDispose(gltf.scene);
        return;
      }

      VRMUtils.combineSkeletons(vrm.scene);
      VRMUtils.combineMorphs(vrm);
      VRMUtils.removeUnnecessaryVertices(vrm.scene);
      const leftArm = vrm.humanoid.getNormalizedBoneNode('leftUpperArm');
      const rightArm = vrm.humanoid.getNormalizedBoneNode('rightUpperArm');
      if (leftArm) leftArm.rotation.z = -1.2;
      if (rightArm) rightArm.rotation.z = 1.2;
      const head = vrm.humanoid.getNormalizedBoneNode('head');
      const height = head?.getWorldPosition(new Vector3()).y ?? 0;
      loaded = { vrm, mixer: new AnimationMixer(vrm.scene), head, scale: height > .5 ? 1.45 / height : 1 };
      setAvatar(loaded);

      try {
        const animation = await readAsset('/models/caretaker-greeting.vrma', signal);
        const animationLoader = new GLTFLoader();
        animationLoader.register((parser) => new VRMAnimationLoaderPlugin(parser));
        const { userData } = await animationLoader.parseAsync(animation, '/models/');
        if (signal.aborted || !userData.vrmAnimations?.[0]) return;

        if (vrm.lookAt) {
          const proxy = new VRMLookAtQuaternionProxy(vrm.lookAt);
          proxy.name = 'caretakerLookAt';
          vrm.scene.add(proxy);
        }
        const clip = createVRMAnimationClip(userData.vrmAnimations[0], vrm);
        const action = loaded.mixer.clipAction(clip).setLoop(LoopOnce, 1);
        setGreeting(action);
      } catch {
        // The avatar remains interactive when its optional greeting is unavailable.
      }
    }

    void load().catch(() => {
      // Keep the geometry placeholder if the model cannot be loaded.
    });
    return () => {
      controller.abort();
      if (loaded) {
        loaded.mixer.stopAllAction();
        loaded.mixer.uncacheRoot(loaded.vrm.scene);
        VRMUtils.deepDispose(loaded.vrm.scene);
      }
    };
  }, []);

  useEffect(() => {
    canvas.dataset.caretaker = avatar ? (greeting ? 'animated' : 'avatar') : 'placeholder';
    return () => { delete canvas.dataset.caretaker; };
  }, [canvas, avatar, greeting]);

  useEffect(() => {
    if (!talking || !greeting) return;
    greeting.reset().play();
    return () => { greeting.stop(); };
  }, [talking, greeting]);

  useFrame(({ clock }, delta) => {
    if (!avatar) return;
    if (avatar.head) avatar.head.rotation.x = talking ? 0 : Math.sin(clock.elapsedTime * 1.4) * .035;
    avatar.mixer.update(delta);
    avatar.vrm.update(delta);
  });

  return avatar
    ? <primitive object={avatar.vrm.scene} scale={avatar.scale} rotation={[0, .42, 0]} />
    : children;
}
