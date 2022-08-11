import { Quaternion, Vec3 } from "cannon-es";
import * as THREE from "three";

export function convertCannonEsVector(vector: Vec3): THREE.Vector3 {
  return vector as unknown as THREE.Vector3;
}

export function convertCannonEsQuaternion(
  quaternion: Quaternion
): THREE.Quaternion {
  return quaternion as unknown as THREE.Quaternion;
}

export function convertThreeVector(vector: THREE.Vector3): Vec3 {
  return vector as unknown as Vec3;
}

export function convertThreeQuaternion(
  quaternion: THREE.Quaternion
): Quaternion {
  return quaternion as unknown as Quaternion;
}
